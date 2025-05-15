"use client"

import Header from '@/components/header'
import axios from 'axios';
import React, { use, useEffect } from 'react'
import { useUser } from '@clerk/nextjs';

function Provider({children}) {
    const { user } = useUser();
    
    useEffect(() =>{
        user && CheckIsNewUser();
    }, [user]);
    
    const CheckIsNewUser = async () =>{
        const result = await axios.post('/api/user', {
            user
        });
        console.log(result);

    }


  return (
    <div>
        <Header />
        <div>
            {children}
        </div>
    </div>
  )
}

export default Provider