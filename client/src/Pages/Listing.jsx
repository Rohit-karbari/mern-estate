import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import {Swiper, SwiperSlide} from "swiper/react"
import SwiperCore from "swiper"
import {Navigation} from 'swiper/modules'
import "swiper/css/bundle"

export default function Listing() {
    SwiperCore.use([Navigation])
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const params = useParams()
    console.log(params)
    useEffect(() => {
        const fetching = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/listing/get/${params.id}`)
                const data = await res.json();
                if(data.success === false){
                    setError(true);
                    setLoading(false);
                    return;
                }
                setListing(data);
                setLoading(false)
            } catch (error) {
                setError(false)
                setLoading(false)
            }
            
        }
        fetching();
    }, [params.id])

    console.log(listing);
  return (
    <main>
        {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
        {error && <p className='text-red-100 text-center my-7 text-2xl'>Something went wrong!!</p>}
        {listing && !loading && !error && 
            <div>
                <Swiper navigation>
                    {
                        listing.imageUrls.map((url) => (
                            <SwiperSlide key={url}>
                                <div className='h-[650px]' style={{background:`url(${url}) center no-repeat`, backgroundSize:'cover' }}></div>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </div>
        }
    </main>
  )
}
