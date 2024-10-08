import React, { useEffect, useState } from 'react'
import{Link} from "react-router-dom"
import {useSelector, useDispatch} from "react-redux"
import { useRef } from 'react'
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage"
import {app} from '../firebase'
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutUserStart, signoutUserFailure, signoutUserSuccess } from '../redux/user/userSlice'

export default function Profile() {
  const fileRef = useRef(null);
  const {currentUser, loading, error} = useSelector((state) => state.user)
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUplaodError] = useState(false);
  const [formData, setFormData] = useState({})
  const dispatch = useDispatch();
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [showListingError, setShowListingError] = useState(false);
  const [currentUserListings, setCurrentUserListings] = useState([]);

  console.log(currentUserListings);

  //firebase storeage
      // allow read;
      // allow write: if
      // request.resource.size < 2 * 1024 * 1024 &&
      // request.resource.contentType.matches('image/.*')
      console.log(error);
      useEffect(() => {
        if(file){
          handleFileupload(file);
        }
      }, [file]);

      const handleFileupload = () => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName)
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
          (snapshot)=> {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setFilePerc(Math.round(progress));
          },
        (error)=> {
          setFileUplaodError(true);
        },
        ()=> {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => 
            setFormData({...formData, avatar: downloadURL})
          )
        });
      };

      const handleChange = (e) => {
        setFormData({...formData, [e.target.id]: e.target.value})
      }

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          dispatch(updateUserStart());
          const res = await fetch(`/api/user/update/${currentUser._id}`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
          });
          const data = await res.json();
          if(data.success === false){
            dispatch(updateUserFailure(data.message));
            return
          }
          dispatch(updateUserSuccess(data));
          setUpdateSuccess(true)
        } catch (error) {
          dispatch(updateUserFailure(error.message));
        }
      }
      const handleDeleteUser = async (e) => {
        try {
          dispatch(deleteUserStart())
          const res = await fetch(`/api/user/delete/${currentUser._id}`, {
            method: "DELETE"
          })
          const data = await res.json();
          if(data.success === false){
            dispatch(deleteUserFailure(data.message));
          }
          dispatch(deleteUserSuccess(data));
        } catch (error) {
          dispatch(deleteUserFailure(error.message));
        }
      }
      const handleSignout = async ()=> {
        try {
          dispatch(signoutUserStart());
          const res = await fetch("/api/auth/signout");
          const data = await res.json();
          if(data.success === false){
            dispatch(signoutUserFailure(data.message));
            return;
          }
          dispatch(signoutUserSuccess(data))
        } catch (error) {
          dispatch(signoutUserFailure(data.message));
        }
      }

      const handleShowList = async () => {
        try {
          setShowListingError(false);
          const res = await fetch(`/api/user/listings/${currentUser._id}`);
          const data = await res.json();
          if(data.success === false){
            setShowListingError(true);
            return;
          }
          setCurrentUserListings(data);
        } catch (error) {
          setShowListingError(true);
        }
    }

    const handleListingDelete = async (listingId) => {
      try {
        const res = await fetch(`/api/listing/delete/${listingId}`, {
          method:'DELETE'
        })
        const data = await res.json()
        if(data.success === false){
          console.log(error)
          return
        }
        setCurrentUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
      } catch (error) {
        console.log(error.message)
      }
    }
  return (
    <div className='p-3 max-w-lg mx-auto '>
      <h1 className='test-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type='file' onChange={(e) => setFile(e.target.files[0])} ref={fileRef} hidden accept='image/*'/>
        <img onClick={()=> fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'/>
        <p className='text-sm self-center'>
          {fileUploadError ? (<span className='text-red-700'>Error Image upload (image must be less then 2mb)</span>) : filePerc > 0 && filePerc < 100 ? 
            (<span className='text-slate-700'> {`uploading ${filePerc}%`}</span>) :
            filePerc === 100 ? (
              <span className='text-green-700'>Image Successfully uploaded</span>
            ):""
          }
        </p>
        <input type='text' onChange={handleChange} defaultValue={currentUser.username}placeholder='username' id='username' className='border p-3 rounded-lg'/>
        <input type='text' onChange={handleChange} defaultValue={currentUser.email}placeholder='email' id='email' className='border p-3 rounded-lg'/>
        <input type='password' onChange={handleChange} placeholder='password' id='password' className='border p-3 rounded-lg'/>
        <button disabled={loading}className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>{loading? "Loading...": "Update"}</button>
        <Link className = "bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"to="/create-listing">
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser}className='text-red-700 cursor-pointer'>Delete account</span>
        <span onClick={handleSignout} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error : ""}</p>
      <p className='text-green-700 mt-5'>{updateSuccess? "User is updated succesfully!": null}</p>
      <button className='text-green-700 w-full' onClick={handleShowList}>Show Listings</button>
      <p>{showListingError ? "Error showing listing":null}</p>
      {
        currentUserListings && currentUserListings.length > 0 && 
        <div className='flex flex-col gap-4'>
          <h1 className='text-center my-7 text-2xl font-semibold'>Your Listings </h1>
      {currentUserListings.map((listing) => (
          <div key={listing._id} className='border p-3 flex justify-between items-center rounded-lg gap-4'>
            <Link to={`/listing/${listing._id}`}>
              <img src={listing.imageUrls[0]} alt='Listing' className='h-15 w-16 object-contain'/>
            </Link>
            <Link to={`/listing/${listing._id}`} className='text-slate-700 font-semibold flex-1 hover:underline truncate'><p>{listing.name}</p></Link>
            <div className='flex flex-col items-center'>
              <button onClick={() => handleListingDelete(listing._id)} className='text-red-700 items-center uppercase'>Delete</button>
              <Link to={`/update-listing/${listing._id}`}>
              <button className='text-green-700 items-center uppercase'>Edit</button>
              </Link>
            </div>
          </div>
        ))}
        </div>
      }
    </div>
  )
}
