import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Membership from './membership';

const Router = () => {
	return (
		<BrowserRouter>
    <Routes>               
        <Route path='/' element={<App />} />
        <Route path='/Link' element={<Membership />}/>
    </Routes>
    </BrowserRouter>
	);
};

export default Router;