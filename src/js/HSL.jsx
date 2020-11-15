import React, { Fragment } from 'react'
import moment from 'moment'
import { useQuery, gql } from '@apollo/client'
import { GiphyProvider } from './Giphy'

function HSL({ stoptimesWithoutPatterns }) {
    if (stoptimesWithoutPatterns.length === 0) {
        return (
            <Fragment>
                <h2>No buses leaving next 60min</h2>
                <GiphyProvider />
            </Fragment>
        )
    }

    return (
        <table>
            <tbody>
                {stoptimesWithoutPatterns.map((stoptime) => {
                    const departureIn = moment(stoptime.realtimeDeparture).diff(moment(), 'minutes')

                    const displayDepTime = departureIn === 0 ? 'Nyt' : `${departureIn} min`
                    return (
                        <tr key={Math.random()}>
                            <td className="shortName">{stoptime.shortName}</td>
                            <td>{stoptime.headsign}</td>
                            <td className="departure">
                                <div>{displayDepTime}</div>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

const STOP_ID = 2323251

const STOP_DATA = gql`
    {
        stop(id: "HSL:${STOP_ID}") {
            name
            stoptimesWithoutPatterns(numberOfDepartures: 8) {
                realtimeDeparture
                realtime
                headsign
                serviceDay
                trip {
                    route {
                        shortName
                    }
                }
            }
        }
    }
`

export function HSLProvider() {
    const { loading, error, data } = useQuery(STOP_DATA, { pollInterval: 10 * 1000 })

    if (loading)
        return (
            <div id="hsl">
                <h2>Loading...</h2>
            </div>
        )
    if (error)
        return (
            <div id="hsl">
                <h2>Error with HSL API :(</h2>
                <GiphyProvider search={'error'} />
            </div>
        )

    const stoptimesWithoutPatterns = data.stop.stoptimesWithoutPatterns
        .map((stoptime) => {
            return {
                realtime: stoptime.realtime,
                shortName: stoptime.trip.route.shortName,
                headsign: stoptime.headsign,
                realtimeDeparture: (stoptime.realtimeDeparture + stoptime.serviceDay) * 1000
            }
        })
        .filter((stoptime) => moment(stoptime.realtimeDeparture).diff(moment(), 'minutes') < 60)

    return (
        <div id="hsl">
            <HSL stoptimesWithoutPatterns={stoptimesWithoutPatterns} stopName={data.stop.name} />
        </div>
    )
}
