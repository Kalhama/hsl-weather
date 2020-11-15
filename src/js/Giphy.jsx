import React, { useEffect, useState } from 'react'
import { GiphyFetch } from '@giphy/js-fetch-api'

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function Giphy({ images }) {
    const [gif, selectGif] = useState()

    useEffect(() => {
        const selectRandomGif = () => {
            const i = random(0, images.length - 1)
            selectGif(images[i].images.original_mp4.mp4)
        }

        selectRandomGif()

        const timer = setInterval(selectRandomGif, 10 * 1000)
        return function cleanup() {
            clearInterval(timer)
        }
    }, [])

    if (!gif) return 'no gifs'
    return <video autoPlay={true} loop={true} src={gif} />
}

export function GiphyProvider({ search }) {
    const [offset, setOffset] = useState(0)
    const [result, setData] = useState({
        loading: true,
        error: undefined,
        data: undefined
    })

    useEffect(() => {
        function fetch() {
            const APIKEY = 'V0MCJ5vJGQi10bvlxwRSXvJb3SELk3Vv'
            const gf = new GiphyFetch(APIKEY)

            const options = { type: 'gifs', limit: 50, offset }

            const gfPromise = search ? gf.search(search, options) : gf.trending(options)

            gfPromise
                .then((res) => {
                    if (res.pagination.total_count + 50 > offset) {
                        setOffset(0)
                    } else {
                        setOffset(offset + 50)
                    }
                    setData({ data: res.data, loading: false, error: undefined })
                })
                .catch((error) => {
                    setData({ error })
                })
        }

        fetch()

        const interval = setInterval(fetch, 10 * 60 * 1000)

        return function cleanup() {
            clearInterval(interval)
        }
    }, [])

    const { loading, error, data } = result

    if (loading) return null
    if (error) return null

    return <Giphy images={data} />
}
