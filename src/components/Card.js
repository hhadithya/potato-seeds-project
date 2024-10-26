import React from 'react';

const Card = ({ id, name, harvest, image ,title, subtitle }) => {
  return (
    <div className='flex flex-col items-center p-6 bg-white rounded-lg shadow-sm max-w-md text-sm'>
      <h1 className="text-sm font-semibold text-gray-800 mb-4 ">{title}</h1>
      <div className="flex items-center ">
        {/* Image Section */}
        <div className="mr-4">
          <img
            className="w-24 h-24 rounded-full object-cover"
            src={image}
            alt={name}
          />
        </div>

        {/* Info Section */}
        <div className="text-left flex flex-col gap-1">
          <p className="text-gray-800 font-medium">
            <span className="font-semibold">ID:</span> {id}
          </p>
          <p className="text-gray-800 font-medium">
            <span className="font-semibold">Name:</span> {name}
          </p>
          <p className="text-gray-800 font-medium">
            <span className="font-semibold">This {subtitle} Harvest:</span> {harvest} kg
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
