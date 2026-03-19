"use client"

import React, { useState } from 'react'
import Wrapper from '../components/Wrapper'
import CategorieModal from '../components/CategorieModal';
import UniteModal from '../components/unitModal';


const page = () => {

  const[name , setName] =useState('');
  const[description , setDescription] =useState('');
  const[loading , setLoading] =useState(false);
  const[editMode , setEditMode] =useState(false);
  const[unire , setUnite] =useState(null);

  const loadCategory = () => {}

  const onpenCreateModal = () => {
    setEditMode(false);
    setName('');
    setDescription('');
    (document.getElementById('category_modal') as HTMLDialogElement)?.showModal() 
  }

  const closeModal = () => {
    setEditMode(false);
    setName('');
    setDescription('');
    (document.getElementById('category-modal') as HTMLDialogElement)?.close() 
  }

 const createCategory = () => {}
 const modifierCategory = () => {}

  return (
    <Wrapper>
       <div>
          <div className='mb-4'>
              <button className='btn btn-primary' onClick={onpenCreateModal}>
                Ajouter une unité
              </button>
          </div>
       </div>
       
          <UniteModal
            name={name}
            description={description}
            loading={loading}
            onchangeName={setName}
            onchangeDescription={setDescription}
            onclose={closeModal}
            onSubmit={editMode? modifierCategory: createCategory}
            editMode={editMode}
          />
    </Wrapper>
  )
}

export default page
