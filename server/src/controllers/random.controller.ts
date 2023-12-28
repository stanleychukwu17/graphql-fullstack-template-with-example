// import { errorLogger, log } from '../logger/';
import { pick } from 'lodash'
import { pool } from '../db'
import {show_bad_message, show_good_message} from '../functions/utils'

//*--start--games
// creates a new game
export async function add_a_new_game_to_the_db (title: string, dateReleased: string) {
    const good_msg = show_good_message()

    // checks to see if there are any active sessions for this user
    const qCheck = await pool.query("SELECT id from games where title = $1 limit 1", [title])
    const num_rows = qCheck.rows.length
    if (num_rows > 0) {
        return show_bad_message('This game already exists')
    }

    // create a new session and return it
    const qIn = await pool.query("INSERT INTO games (title, date_released) values ($1, $2) RETURNING *", [title, dateReleased])

    return {...good_msg, ...qIn.rows[0]}
}

// delete a game from the database
export async function delete_game_from_db (id:number) {
    const qCheck = await pool.query("DELETE from games where id = $1", [id])
    return {...show_good_message()}
}

// updates a game record
export async function updates_the_record_of_a_game ({id, title, date}: {id:number, title:string, date:string}) {
    const qIn = await pool.query("UPDATE games SET title = $1, date_released = $2 WHERE id = $3", [title, date, id])
    return {...show_good_message()}
}

// game- returns all of the games
export async function get_all_the_games_on_db () {
    const qCheck = await pool.query("SELECT * from games order by id desc")
    const qResult = qCheck.rows

    if(qResult.length > 0) {
        const sumUp = qResult.map(async (row: {id:number}) => {
            let q1 = await get_total_number_of_users_who_played_this_game(row.id)
            let q2 = await get_total_number_of_reviews_for_this_game(row.id)
            row = {...row, ...q1, ...q2}
            return row
        })
    
        // returns the final result wrapped in a promise
        const allResult = await Promise.all(sumUp).then(re => { return re })
        return allResult
    }

    return qCheck.rows
}

// game- return the total number of users who played a game
export async function get_total_number_of_users_who_played_this_game (game_id: number) {
    const qs = await pool.query("SELECT count(*) as total_users_played from who_played_game where game_id = $1", [game_id])
    return qs.rows[0]
}

// game- return the total number of reviews a game has
export async function get_total_number_of_reviews_for_this_game (game_id: number) {
    const qs = await pool.query("SELECT count(*) as total_reviews from game_reviews where game_id = $1", [game_id])
    return qs.rows[0]
}

// game- get a game by using the game id
export async function get_a_game_using_the_id(id:number) {
    const qCheck = await pool.query("SELECT * from games where id = $1 limit 1", [id])
    const num_rows = qCheck.rows.length
    const game = qCheck.rows[0]
    return game
}
//*--end--games

//*--start--authors
// returns all of the games
export async function get_all_the_authors_on_db () {
    const qCheck = await pool.query("SELECT * from users order by id desc")
    return qCheck.rows
}

// get a game by using the game id
export async function get_a_author_using_the_id(id:number) {
    const qCheck = await pool.query("SELECT * from users where id = $1 limit 1", [id])
    return qCheck.rows[0]
}
//*--end--authors

//*--start--reviews
// creates a new game
export type newReview = {
    gameId: number,
    authorId: number,
    rating: number,
    content: string,
}
export async function add_a_new_review_to_the_db ({gameId, authorId, rating, content}: newReview) {
    const good_msg = show_good_message()

    // create a new session and return it
    const qIn = await pool.query("INSERT INTO game_reviews (game_id, author_id, rating, content, date_added) values ($1, $2, $3, $4, now()) RETURNING *", [gameId, authorId, rating, content])

    return {...good_msg, ...qIn.rows[0]}
}

// returns all of the games
type allReviewsProps = {
    useOne?: 'yes',
    useWch?: 'game_id' | 'author_id',
    useId?: number,
}
export async function get_all_the_reviews_on_db ({useOne, useWch, useId}: allReviewsProps) {
    if (useOne === 'yes') {
        const qCheck = await pool.query(`SELECT * from game_reviews where ${useWch} = $1 order by id desc`, [useId])
        return qCheck.rows
    } else {
        const qCheck = await pool.query("SELECT * from game_reviews order by id desc")
        return qCheck.rows

    }
}

// get a game by using the game id
export async function get_a_review_using_the_id(id:number) {
    const qCheck = await pool.query("SELECT * from game_reviews where id = $1 limit 1", [id])
    return qCheck.rows[0]
}
//*--end--reviews