import React, { useState, useEffect } from 'react';

export interface ItemProps {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    data?: any;
}

const GridView = ({ items, itemSelected } : { items: ItemProps[], itemSelected: (item: ItemProps) => void }) => {
    const [itemSize, setItemSize] = useState(256); // Default to large size
    const [columns, setColumns] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;

            if (width >= 1024) {
                setItemSize(256); // Large size
            } else if (width >= 768) {
                setItemSize(128); // Medium size
            } else {
                setItemSize(64); // Small size
            }

            const newColumns = Math.floor(width / itemSize);
            setColumns(newColumns > 0 ? newColumns : 1);
        };

        handleResize(); // Set initial values
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [itemSize]);

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
    };

    const itemStyle = {
        width: `${itemSize}px`,
        height: `${itemSize}px`,
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ccc',
        borderRadius: '8px',
    };

    return (
        <div style={gridStyle}>
            {items.map((item) => (
                <div key={item.id} style={itemStyle} title={item.description || item.title} onClick={() => itemSelected(item)}>
                    {item.title}
                </div>
            ))}
        </div>

    );
};

export default GridView;