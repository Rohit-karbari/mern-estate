import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import {Swiper, SwiperSlide} from "swiper/react"
import SwiperCore from "swiper"
import {Navigation} from 'swiper/modules'
import "swiper/css/bundle"
import { FaBath, FaBed, FaChair, FaMapMarkedAlt, FaParking } from 'react-icons/fa'
import { current } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import ContactComponent from '../Components/ContactComponent'

export default function Listing() {
    SwiperCore.use([Navigation])
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [contact, setContact] = useState(false);
    const params = useParams()
    const {currentUser} = useSelector((state) => state.user)
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
            <>
            <div className='items-center'>
                <Swiper navigation>
                    {
                        listing.imageUrls.map((url) => (
                            <SwiperSlide key={url}>
                                <div className='h-[450px]' style={{background:`url(${url}) center no-repeat`, backgroundSize:'cover' }}></div>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </div>
            <div className='flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4'>
                <p className='text-xl font-bold items-center mt-6 gap-2 my-2 '>{listing?.name} - $ {listing?.regularPrice.toLocaleString("en-US")}{listing?.type === " rent" && " / month"}</p>

                <p className='flex items-center mt-6 gap-2 text-slate-600 text-sm '>
                    <FaMapMarkedAlt className='text-green-700'/>
                {listing?.address}
                </p>
                <div className='flex gap-4 mt-6'>
                    <p className='bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md '>{listing.type === "rent" ? "For Rent" : "For Sale"}</p>
                    {listing.offer && <p className='bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md '>$ {listing.regularPrice - +listing.discountPrice}</p>}
                </div>
                <p className='text-slate-800'>
                    <span className='font-semibold text-black'>Description - {' '}</span>
                    {listing.description}
                </p>
                <ul className='text-green-900 font-semibold text-sm items-center gap-4 sm:gap-6 flex flex-wrap'>
                    <li className='flex items-center gap-1 text-green-900 whitespace-nowrap font-semibold text-sm'><FaBed className='text-lg'/>
                    {listing.bedrooms > 1 ? `${listing.bedrooms} beds `: `${listing.bedrooms} bed`}
                    </li>
                    <li className='flex items-center gap-1 text-green-900 whitespace-nowrap font-semibold text-sm'><FaBath className='text-lg'/>
                    {listing.bedrooms > 1 ? `${listing.bedrooms} bathrooms `: `${listing.bedrooms} bathroom`}
                    </li>
                    <li className='flex items-center gap-1 text-green-900 whitespace-nowrap font-semibold text-sm'><FaParking className='text-lg'/>
                    {listing.parking ? `Parking Spot`: `${listing.bedrooms} No parking`}
                    </li>
                    <li className='flex items-center gap-1 text-green-900 whitespace-nowrap font-semibold text-sm'><FaChair className='text-lg'/>
                    {listing.furnished ? `Furnished `: `Non Furnished`}
                    </li>
                </ul>
                {currentUser && listing.userRef !== currentUser._id && !contact && (

                    <button onClick={() => setContact(true)}className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3'>Contact Landlord</button>
                )}
                {contact && <ContactComponent listing={listing}/>}
            </div>
           </>
        }
    </main>
  )
}
