"use client"
// import {useQuery} from '@apollo/experimental-nextjs-app-support/ssr';
import {useMutation, useQuery} from "@apollo/client"
import {useForm, SubmitHandler} from "react-hook-form"
import {GET_REVIEWS_4_THIS_GAME} from "@/app/graphql/queries"
import {ADD_NEW_REVIEW_FOR_THIS_GAME} from "@/app/graphql/mutations"
import './page.scss'
import { useCallback } from "react"

type EachReviewProp = {
    id:number,
    title:string,
    content:string,
    author: {
        name: string
    }
}
// title, username, date_written, ratings
const EachReviewComponent = (prop: EachReviewProp) => {
    const authorImg = `${prop.author.name[0]}${prop.author.name[1]}`
    // console.log(prop)
    return (
        <div className="EchGameCvr">
            <div className="it_fl profImg">
                {authorImg}
            </div>
            <div className="it_fl w-[80%] ml-5 py-1">
                <div className="">{prop.content}</div>
                <div className="">
                    {prop.author.name}
                </div>
            </div>
        </div>
    )
}



type GameReviewProps = {
    params: {
        gameId : number
    }
}
type add_new_review_form_props = {
    authorId: number,
    ratings: number,
    content: string
}
export default function GameReviewPage({params} : GameReviewProps) {
    const gameId = Number(params.gameId)
    const {data: gameReviewsData, loading: gameReviewsLoading, error: errorLoadingReviews, refetch: refetch_all_the_reviews} = useQuery(GET_REVIEWS_4_THIS_GAME, {  // get all the game reviews and users who played this game
        variables: {id: gameId}
    })
    const [ addNewReviewMutation, {data: newReviewData, loading: addNewItemLoading, error: errorInAddingReview, reset: resetNewReviewMutation} ] = useMutation(ADD_NEW_REVIEW_FOR_THIS_GAME, {errorPolicy: 'all'}) // apollo-graphql mutation for adding a new review for a game
    const { register: registerGameInput, handleSubmit: handleNewGameSubmit, setValue: newGameSetValue, formState: {errors:newGameError} } = useForm<add_new_review_form_props>() // react-hook-form for adding a review

    // the react-hook-form submit handler, calls the mutation function to create a new game record
    const create_this_new_game_record: SubmitHandler<add_new_review_form_props> = (data) => {
        // sends the new game to the graphql server to be saved
        addNewReviewMutation({variables:{
            info: {gameId, authorId:Number(data.authorId), rating: Number(data.ratings), content: data.content}
        }})
    }

    const clear_the_input_fields = useCallback(() => {
        newGameSetValue("authorId", 0)
        newGameSetValue("ratings", 0)
        newGameSetValue("content", "")
    }, [newGameSetValue])

    // if adding of a new review was created successfully, we want to refetch the reviews
    if (newReviewData) {
        refetch_all_the_reviews()
        resetNewReviewMutation()
        clear_the_input_fields()
    }

    return (
        <>
            {gameReviewsData && (
                <section className="reviewsSection">
                    <div className="text-5xl capitalize font-semibold">{gameReviewsData.gameDts.title}</div>
                    <div className="my-4 py-2 px-4 bg-[#67f2d1] w-[50px] text-lg font-bold whitespace-nowrap">{gameReviewsData.gameDts.total_reviews} reviews &nbsp; &nbsp; ⭐⭐</div>
                    <div className="flex">
                        <div className="RvwDtsCvr w-[70%] py-7">
                            {gameReviewsData.gameDts.reviews.map((item: EachReviewProp) => {
                                return (<EachReviewComponent {...item} key={`ecRvw${item.id}`} />)
                            })}
                        </div>
                        <div className="AddReviewMCvr">
                            <div className="text-2xl font-medium">Add a new review</div>
                            <div className="GInp_General">
                                <form onSubmit={handleNewGameSubmit(create_this_new_game_record)}>
                                    <div className="GInp_cvr">
                                        <div className="GInp_title">Author ID</div>
                                        <div className="GInp_input">
                                            <input type="number" {...registerGameInput("authorId", { required: true, minLength: 1 })} />
                                            {newGameError.authorId && <p className='text-sm font-semibold text-[#df0e3a] pt-1'>This field is required with minimum of 5 letters</p>}
                                        </div>
                                    </div>
                                    <div className="GInp_cvr">
                                        <div className="GInp_title">Ratings</div>
                                        <div className="GInp_input">
                                            <input type="number" {...registerGameInput("ratings", { required: true, minLength: 1, maxLength: 1 })} />
                                            {newGameError.authorId && <p className='text-sm font-semibold text-[#df0e3a] pt-1'>This field is required with minimum of 5 letters</p>}
                                        </div>
                                    </div>
                                    <div className="GInp_cvr">
                                        <div className="GInp_title">Contents</div>
                                        <div className="GInp_input">
                                            <textarea cols={40} rows={5} {...registerGameInput("content", { required: true, minLength: 5 })}></textarea>
                                            {newGameError.authorId && <p className='text-sm font-semibold text-[#df0e3a] pt-1'>This field is required with minimum of 5 letters</p>}
                                        </div>
                                    </div>
                                    <div className="GInp_Btn GenBtn1">
                                        {
                                            addNewItemLoading ? (<button type="submit" className='opacity-50' disabled>Saving... </button>) : (<button type="submit">Save new game </button>)
                                        }
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            )}
            {!gameReviewsData && (
                <p className="text-5xl capitalize font-semibold">Loading...</p>
            )}
        </>
    )
}