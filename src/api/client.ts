import axios from "axios";

export const PockeClient= axios.create({
    baseURL: process.env.EXPO_PUBLIC_POKEAPI_URL,
    headers:{'Content-Type': 'application/json'}
})

export const MockClient= axios.create({
    baseURL: process.env.EXPO_PUBLIC_MOCKAPI_URL,
    headers:{'Content-Type': 'application/json'}
})