import { gql } from "@apollo/client";

// --start-- games
export const GET_ALL_THE_GAMES = gql`
    query GET_ALL_THE_GAMES_QUERY {
        games {
            id
            title
            date_released
            total_users_played
            total_reviews
        }
    }
`
// --end--

// --start-- reviews
export const GET_REVIEWS_4_THIS_GAME = gql`
    query GET_REVIEWS_4_THIS_GAME_QUERY ($id: Int!) {
        gameDts (id: $id) {
            title
            date_released
            total_reviews
            total_users_played
            reviews {
                id
                rating
                content
                author {
                    name
                }
            }
        }
    }
`
// --end--