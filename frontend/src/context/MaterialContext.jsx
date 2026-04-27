import React, { createContext, useState, useContext, useEffect } from 'react';

const MaterialContext = createContext();

export const MaterialProvider = ({ children }) => {
    // Check localStorage for previously selected material, default to 'Steel'
    const [selectedMaterial, setSelectedMaterial] = useState(() => {
        return localStorage.getItem('selectedMaterial') || 'Steel';
    });

    // Options for the material selector
    const materials = [
        { id: 'Steel', name: 'Steel', icon: '🏗️', unit: 'Tons' },
        { id: 'Electronics', name: 'Electronics', icon: '💻', unit: 'Units' },
        { id: 'Construction', name: 'Construction', icon: '🧱', unit: 'Bags/Units' }
    ];

    const currentMaterial = materials.find(m => m.id === selectedMaterial) || materials[0];

    useEffect(() => {
        localStorage.setItem('selectedMaterial', selectedMaterial);
    }, [selectedMaterial]);

    return (
        <MaterialContext.Provider value={{ 
            selectedMaterial, 
            setSelectedMaterial, 
            materials,
            currentMaterial
        }}>
            {children}
        </MaterialContext.Provider>
    );
};

export const useMaterial = () => useContext(MaterialContext);
