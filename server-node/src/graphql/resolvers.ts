// const { ApolloError } = require('apollo-server');
import {ApolloError} from 'apollo-server-errors'

import {
    newReview,
    add_a_new_game_to_the_db, get_all_the_games_on_db, get_a_game_using_the_id, updates_the_record_of_a_game, delete_game_from_db, get_all_the_authors_on_db, get_a_author_using_the_id,
    get_total_number_of_reviews_for_this_game, add_a_new_review_to_the_db, get_all_the_reviews_on_db, get_a_review_using_the_id
} from '../controllers/random.controller'

type parent = {
    id: number
}

const resolvers = {
    Query : {
        async game (_:parent, {id}: {id: number}) {
            return await get_a_game_using_the_id(id)
        },

        async gameDts (_:parent, {id}: {id: number}) {
            return await get_a_game_using_the_id(id)
        },

        async games () {
            return await get_all_the_games_on_db()
        },

        async author (_:parent, {id}: {id: number}) {
            return await get_a_author_using_the_id(id)
        },

        async authors () {
            return await get_all_the_authors_on_db()
        },

        async review (_:parent, {id}: {id: number}) {
            return await get_a_review_using_the_id(id)
        },

        async reviews () {
            return await get_all_the_reviews_on_db({})
        },
    },
    Mutation: {
        async createGame (_: parent, {title, date}: {title: string, date: string}) {
            const newGame = await add_a_new_game_to_the_db(title.toLowerCase(), date.toLowerCase())
            if (newGame.msg === 'bad') {
                throw new ApolloError(newGame.cause, '409');
            } else {
                return newGame
            }
        },

        async updateGame (_: parent, {id, title, date}: {id: number, title: string, date: string}) {
            const updateGame = await updates_the_record_of_a_game({id, title, date})
            return await get_a_game_using_the_id(id)
        },

        async deleteGame (_: parent, {id}: {id: number}) {
            const deleteGame = await delete_game_from_db(id)
            return {'msg':'okay'}
        },

        async createReview (
                _: parent, {info: {authorId, gameId, rating, content}}: {info: newReview}
            ) {
            const newReview = await add_a_new_review_to_the_db({authorId, gameId, rating, content})
            return newReview
        }
    },

    GameDts : {
        // get all the reviews for a game
        async reviews (parent: parent) {
            const gameId = parent.id
            const james = await get_all_the_reviews_on_db({useOne:'yes', 'useWch':'game_id', useId: gameId})
            return james
        },

        async total_reviews (parent: parent) {
            const gameId = parent.id
            const {total_reviews} = await get_total_number_of_reviews_for_this_game(gameId)
            return total_reviews
        }
    },

    Author : {
        // get all the reviews for an author
        async reviews (parent: parent) {
            const AuthorId = parent.id
            return await get_all_the_reviews_on_db({useOne:'yes', 'useWch':'author_id', useId: AuthorId})
        }
    },

    Review: {
        // get the game for which this review was written for
        async game (parent: parent & {game_id: number}) {
            const gameId = parent.game_id
            return await get_a_game_using_the_id(gameId)
        },

        // get the author who wrote this review
        async author (parent: parent & {author_id: number}) {
            const authorId = parent.author_id
            return await get_a_author_using_the_id(authorId)
        }
    }
}
export default resolvers