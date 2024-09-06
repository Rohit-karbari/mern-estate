import React, { useState, useEffect } from 'react'
import {getDownloadURL, getStorage, uploadBytesResumable, ref} from "firebase/storage"
import {app} from "../firebase"
import { set } from 'mongoose';
import { useSelector } from 'react-redux';
import {useNavigate, useParams} from "react-router-dom"

export default function UpdateListing() {
  const {currentUser} = useSelector(state => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const [files, setFile] = useState([])
  const [formData, setFormData] = useState({
    imageUrls:[],
    name:'',
    description:'',
    address:'',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer:false,
    parking:false,
    furnished:false
  });
  const [ImageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchListing  = async () => {
        const listingId = params.listingid;
        const res = await fetch(`/api/listing/get/${listingId}`)
        const data = await res.json();
        if(data.success === false){
            console.log(data.message);
            return 
        }
        setFormData(data)
    }
    fetchListing()
  }, [])

  const handleImageSubmit = (e) => {
    setUploading(true);
    if(files.length > 0 && files.length + formData.imageUrls.length < 7){
      const promises = [];

      for(let i = 0; i < files.length; i++){
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises).then((urls) => {
        setFormData({...formData, imageUrls: formData.imageUrls.concat((urls))});
        setImageUploadError(false);
        setUploading(false);
      })
      .catch((err) => {
        setImageUploadError("Image upload failed (2mb max per image)");
        setUploading(false);
      })
    }else {
      setImageUploadError("You can only upload 6 images");
      setUploading(false);
    }
  }

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + (file.name || '');
      console.log(fileName);
      const storageref = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageref, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error)
        },
        () => {
          console.log("done")
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL)
          });
        }
      )
    })
  }

  const handleChage = (e) => { 
    if(e.target.id === 'sale' || e.target.id === 'rent'){
    setFormData({...formData, type: e.target.id});
  }
  if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer'){
    setFormData({...formData, [e.target.id]: e.target.checked});
  }
  if(e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea'){
    setFormData({...formData, [e.target.id]: (e.target.value)});
  }
}

  const handleRemoveImage = (index) => {
    // const newImages = formData.imageUrls.filter((_, i) => i !== index);
    // setFormData({...formData, imageUrls: newImages});
    setFormData({...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== index)});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(formData.imageUrls.length < 1){
        setError("Please upload at least one image");
        return
      }
      if(+formData.regularPrice < +formData.discountPrice){
        setError("Discount price cannot be higher than regular price");
        return
      }
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/listing/update/${params.listingid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({...formData, userRef: currentUser._id})
      });
      const data = await res.json();
      console.log(data);
      setLoading(false);
      if(data.success === false){
        setError(data.message);
      }
      navigate(`/listing/${data._id}`)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Update Listing</h1>
      <form onSubmit={handleSubmit}className='flex flex-col sm:flex-row gap-4'> 
        <div className='flex flex-col gap-4 flex-1'>
          <input type='text' 
            placeholder='Name' 
            className='border p-3 rounded-lg' 
            maxLength="62" 
            minLength='10' 
            id='name'
            onChange={handleChage}
            value={formData.name}
          />
          <textarea 
            type='text' 
            placeholder='Description' 
            className='border p-3 rounded-lg ' 
            id='description' 
            required
            onChange={handleChage}
            value={formData.description}
          />
          <input 
            type='text' 
            placeholder='address' 
            className='border p-3 rounded-lg ' 
            id='address'
            required
            onChange={handleChage}
            value={formData.address}
          />
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input type='checkbox' id='sale' className='w-5' onChange={handleChage} checked={formData.type === "sale"}/>
              <span>sell</span>
            </div>
            <div className='flex gap-2'>
              <input type='checkbox' id='rent' className='w-5' onChange={handleChage} checked={formData.type === "rent"}/>
              <span>rent</span>
            </div>
            <div className='flex gap-2'>
              <input type='checkbox' id='parking' className='w-5'onChange={handleChage} 
              checked={formData.parking}
              />
              <span>Parking Spot</span>
            </div>
            <div className='flex gap-2'>
              <input type='checkbox' id='furnished' className='w-5' 
                onChange={handleChage}  
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input type='checkbox' id='offer' className='w-5'
                onChange={handleChage}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className=' flex flex-wrap gap-4'>
              <div className='flex items-center gap-2'>
                <input className='p-3 border border-gray-300 rounded-lg' type='number' id='bedrooms' min='1' max='10' required  
                  onChange={handleChage}
                  value={formData.bedrooms}
                />
                <p>Beds</p>
              </div>
              <div className='flex items-center gap-2'>
                <input className='p-3 border border-gray-300 rounded-lg' type='number' id='bathrooms' min='1' max='10' required 
                  onChange={handleChage}
                  value={formData.bathrooms}
                />
                <p>Baths</p>
              </div>
              <div className='flex items-center gap-2'>
                <input className='p-3 border border-gray-300 rounded-lg' type='number' id='regularPrice' min='50' max='1000000' required 
                  onChange={handleChage}
                  value={formData.regularPrice}
                />
                <div className='flex flex-col items-center'>
                  <p>Regular price</p>
                  <span className='text-xs'>{formData.type == "rent" && '($ / month)'}</span>
                </div>
              </div>
              {formData.offer && 
                <div className='flex items-center gap-2'>
                  
                  <input className='p-3 border border-gray-300 rounded-lg' type='number' id='discountPrice' min='0' max='10000000' required 
                    onChange={handleChage}
                    value={formData.discountPrice}
                  />
                  <div className='flex flex-col items-center'>
                    <p>Discounted Price</p>
                    <span className='text-xs'>{formData.type == "rent" && '($ / month)'}</span>
                  </div>
                </div>
              }       
          </div>
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>Images:
            <span className='font-normal text-grey-600 ml-2'>The first Image will be the cover (max 6)</span>
          </p>
          <div className='flex gap-4'>
            <input onChange={(e) => setFile(e.target.files)}className="p-3 border border-grey-300 rounded w-full"type="file" id="images" accept="image/*" multiple/>
            <button type="button" disabled={uploading} onClick={handleImageSubmit}className='text-green-700 border border-green-700 p-3 rounded uppercase hover:shadow-lg disabled:opacity-80'>{uploading ? "uploading...": "Upload"}</button>
          </div>
          <p className='text-red-700'>{ImageUploadError && ImageUploadError}</p>
          {
            formData.imageUrls?.map((url, index) => {
              return (
                <div key={url}className='flex justify-between p-3 border items-center'>
                  <img key={index} src={url} alt='Listing Image' className='w-20 h-20 object-contain rounded-lg'/>
                  <button className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75' type='button' onClick={()=> handleRemoveImage(index)}>Delete</button>
                </div>
              )
            })
          }
        <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80' disabled={loading || uploading}>{loading ? "updating...":"Update Listing"}</button>
        {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
      </form>
    </main>
  )
}

