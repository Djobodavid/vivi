'use client'

import React, { useState } from 'react'
import Wrapper from '../components/Wrapper'
import ClientModal from '../components/ClientModal';

const page = () => {

  const[name , setName] =useState('');
  const[telephone , setTelephone] =useState('');
  const[address , setAddress] =useState('');
  const[loading , setLoading] =useState(false);
  const[editMode , setEditMode] =useState(false);
  const[client , setClient] =useState(null);


const loadClient = () => {}

  const onpenCreateModal = () => {
    setEditMode(false);
    setName('');
    setTelephone('');
    setAddress('');
    (document.getElementById('category_modal') as HTMLDialogElement)?.showModal() 
  }

  const closeModal = () => {
    setEditMode(false);
    setName('');
    setTelephone('');
    setAddress('');
    (document.getElementById('category_modal') as HTMLDialogElement)?.close() 
  }

 const createCategory = () => {}
 const modifierCategory = () => {} 
  return (
    <Wrapper>
       <div>
          <div className='mb-4'>
              <button className='btn btn-primary' onClick={onpenCreateModal}>
                Ajouter un client
              </button>
          </div>
       </div>
       
          <ClientModal
            name={name}
            telephone={telephone}
            address={address}
            loading={loading}
            onchangeName={setName}
            onchangeTelephone={setTelephone}
            onchangeAddress={setAddress}
            onclose={closeModal}
            onSubmit={editMode? modifierCategory: createCategory}
            editMode={editMode}
          />
    </Wrapper>
  )
}

export default page
