'use client'
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useMutation } from '@apollo/client';
import {useForm, SubmitHandler} from "react-hook-form"
import { FaPencil, FaRegTrashCan  } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import './page.scss'

import { GET_ALL_THE_GAMES } from '@/app/utils/graphql/queries';
import { CREATE_THIS_NEW_GAME_RECORD, UPDATE_THIS_GAME_DETAILS, DELETE_THIS_GAME } from '@/app/utils/graphql/mutations';
import Link from 'next/link';

type GamesProp = {
    id: number
    title: string
    date_released: string
    total_users_played: number
    total_reviews: number
}

// helper component
const GamesComponent = ({total_users_played, total_reviews, ...gameDts}: GamesProp) => {
    const [showEdit, setShowEdit] = useState<boolean>(false)
    const [gameTitle, setGameTitle] = useState(gameDts.title)
    const [gameReleaseDate, setGameReleaseDate] = useState(gameDts.date_released)
    const [updateGameDetails, {data:updateData, loading:updateLoading}] = useMutation(UPDATE_THIS_GAME_DETAILS)
    const [deleteGameRecord, {data, loading: deleteLoading}] = useMutation(DELETE_THIS_GAME)

    const saveTheUpdateOfThisGame = useCallback(() => {
        updateGameDetails({variables:{id:gameDts.id, title: gameTitle, date: gameReleaseDate}})
    }, [gameTitle, gameReleaseDate, gameDts.id, updateGameDetails])

    const deleteThisGameFromTheDb = useCallback(() => {
        deleteGameRecord({variables:{id: gameDts.id}})
    }, [deleteGameRecord, gameDts.id])

    return (
        <div className="py-5">
            <div className="">
                {!showEdit && <div>
                    <div className="text-2xl px-2">{gameTitle}</div>
                    <div className="G_activitiesC py-2 text-sm flex">
                        <div className="">{gameReleaseDate}</div>
                        <div className=""><Link href="/users_played">{total_users_played} users played</Link></div>
                        <div className="">
                            <Link href={`/test/graphql/games/reviews/${gameDts.id}`} className='flex items-center space-x-1'>
                                <span>
                                    <CiStar />
                                </span>
                                <span>{total_reviews} reviews</span>
                            </Link>
                        </div>
                    </div>
                </div>}
                {showEdit && <div>
                    <div className="flex items-center pb-5">
                        <div className="w-32">Game title:</div>
                        <div className=""><input type="text" className='w-[350px]' value={gameTitle} onChange={(e) => { setGameTitle(e.target.value) }} /></div>
                    </div>
                    <div className="flex items-center pb-5">
                        <div className="w-32">Release date:</div>
                        <div className=""><input type="text" value={gameReleaseDate} onChange={(e) => { setGameReleaseDate(e.target.value) }} /></div>
                    </div>
                    <div className="GenBtn1">
                        <button onClick={() => { saveTheUpdateOfThisGame() }}>Save changes</button>
                    </div>
                </div>}
            </div>
            {!showEdit && <div className="G_workBtn">
                <button className='hover:text-[#0056b6]'onClick={() => { setShowEdit(true) }}>
                    <span><FaPencil /></span>
                    <span>Edit game</span>
                </button>
                <button className='hover:text-[#df0e3a]'>
                    <span><FaRegTrashCan /></span>
                    <span onClick={() => { deleteThisGameFromTheDb() }}>Delete game</span>
                </button>
            </div>}
        </div>
    )
}


//--START-- of the main page component
type add_new_game_form = {
    title: string
    date_released: string
}
export default function GamesPage() {
    const {data, loading, refetch: refetch_all_the_games} = useQuery(GET_ALL_THE_GAMES) // get all the games
    const [createNewGameMutation, {data: newGameData, loading: createNewGameLoading, error: errorInCreatingNewGame, reset: resetNewGameMutation}] = useMutation(CREATE_THIS_NEW_GAME_RECORD, {errorPolicy: 'all'}) // apollo-graphql mutation for creating a new game
    const { register: registerGameInput, handleSubmit: handleNewGameSubmit, setValue: newGameSetValue, formState: {errors:newGameError} } = useForm<add_new_game_form>() // react-hook-form for creating a new game

    // clears the input field for creating a new game
    const clear_the_input_fields = useCallback(() => {
        newGameSetValue('title', '')
        newGameSetValue('date_released', '')
    }, [newGameSetValue])

    // the react-hook-form submit handler, calls the mutation function to create a new game record
    const create_this_new_game_record: SubmitHandler<add_new_game_form> = (data) => {
        // sends the new game to the graphql server to be saved
        createNewGameMutation({variables:{title:data.title, date:data.date_released}})
    }
    
    // if there are any errors from the backEnd when creating this game.. we want to gracefully handle the error (by alerting the error message to the user)
    if (errorInCreatingNewGame) {
        // console.log(errorInCreatingNewGame.message, errorInCreatingNewGame.graphQLErrors) // .graphQLErrors gives you more details about the error
        alert(errorInCreatingNewGame.message)
        resetNewGameMutation()
        clear_the_input_fields();
    }

    // if a new game was created successfully, we want to refetch the games
    if (newGameData) {
        refetch_all_the_games()
        resetNewGameMutation()
        clear_the_input_fields()
    }

    return (
        <section className="GameMCvr flex">
            {/* --START-- below is the section where the list of games are displayed */}
            <div className="w-[70%]">
                {loading && <p className='text-2xl font-bold'>Loading...</p>}
                {data && data.games?.map((item: GamesProp) => {
                    return (<GamesComponent key={item.id} {...item} />);
                })}
            </div>
            {/* --END-- */}

            {/* --START-- form for adding a new game */}
            <div className="w-[30%]">
                <div className="text-2xl font-medium">Add a new Game</div>
                <div className="GInp_General">
                    <form onSubmit={handleNewGameSubmit(create_this_new_game_record)}>
                        <div className="GInp_cvr">
                            <div className="GInp_title">Game title</div>
                            <div className="GInp_input">
                                <input type="text" className='w-[350px]' {...registerGameInput("title", { required: true, minLength: 5 })} />
                                {newGameError.title && <p className='text-sm font-semibold text-[#df0e3a] pt-1'>This field is required with minimum of 5 letters</p>}
                            </div>
                        </div>
                        <div className="GInp_cvr">
                            <div className="GInp_title">Release date</div>
                            <div className="GInp_input">
                                <input type="text" {...registerGameInput("date_released", { required: true, minLength: 5 })} />
                                {newGameError.date_released && <p className='text-sm font-semibold text-[#df0e3a] pt-1'>This field is required with minimum of 5 letters</p>}
                            </div>
                        </div>
                        <div className="GInp_Btn GenBtn1">
                            {
                                createNewGameLoading ? (<button type="submit" className='opacity-50' disabled>Saving... </button>) : (<button type="submit">Save new game </button>)
                            }
                        </div>
                    </form>
                </div>
            </div>
            {/* --END-- */}
        </section>
    )
}
// --END-- of the main page component