import React, { useState, useEffect } from 'react';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisVertical as faEllipsis} from '@fortawesome/free-solid-svg-icons';

export interface ItemProps {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    data?: any;
}

interface GridViewProps {
    items: ItemProps[];
    itemSelected?: (item: ItemProps, selected: boolean) => void;
    itemClicked?: (item: ItemProps) => void;
}

const GridView = ({ items, itemSelected, itemClicked } : GridViewProps) => {
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
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ccc',
        borderRadius: '8px',
        position: 'relative' as 'relative',
    };

    const iconStyler = (type: any) => {
        switch(type){
            case "FOLDER":
                return <FontAwesomeIcon icon={faFolder} style={{ fontSize: itemSize / 2, color: '#FFD700' }} />;
            default:
                return <FontAwesomeIcon icon={faFile} style={{ fontSize: itemSize / 2, color: '#FFD700' }} />;;
        }
    }

    return (
        <div style={gridStyle}>
            {items.map((item) => (
                <div key={item.id} style={itemStyle} title={item.description || item.title} onClick={() => itemClicked ? itemClicked(item) : null}>
                    <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 1 }}>
                        <input
                            type="checkbox"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent click from propagating to the item
                                console.log(`Checkbox clicked for item: ${item.id} => ${e.currentTarget.checked}`);
                                itemSelected && itemSelected(item, e.currentTarget.checked);
                            }}
                        />
                    </div>
                    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}>
                        <FontAwesomeIcon icon={faEllipsis} />
                    </div>

                    {iconStyler(item.data)}
                    
                    {item.title}
                </div>
            ))}
        </div>

    );
};

export default GridView;