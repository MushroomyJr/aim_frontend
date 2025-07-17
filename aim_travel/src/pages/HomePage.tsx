import React from 'react';
import FlightSearchForm from '../components/flightsearchform/FlightSearchForm';

const HomePage: React.FC<{ onSearch: (params: any) => void }> = ({ onSearch }) => {
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #fff 100%)', display: 'flex', alignItems: 'center' }}>
            <FlightSearchForm onSearch={onSearch} />
        </div>
    );
};

export default HomePage; 