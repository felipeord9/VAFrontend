import React, { useState, useMemo, useEffect } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Cell, 
    ResponsiveContainer,
    LabelList 
} from 'recharts';

const STATUS_COLORS = {
    'Con evidencia': '#0088FE',
    'Finalizado': '#00C49F',
    'En proceso': '#FFBB28',
    'No realizado': 'grey',
};

const useChartData = (data, status) => {
    return useMemo(() => {
        const filteredData = (status && status !== 'todos')
            ? data.filter(item => item.status === status)
            : data;

        const counts = filteredData.reduce((acc, item) => {
            const statusKey = item.status || 'Sin estado';
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {});

        const chartData = Object.keys(counts).map(key => ({
            name: key, 
            value: counts[key],
            color: STATUS_COLORS[key] || '#999999'
        }));
        
        return { chartData, totalRecords: filteredData.length };
    }, [data, status]);
};

const InteractiveStateBarChart = ({ suggestions, selectedStatus }) => {
    const { chartData, totalRecords } = useChartData(suggestions, selectedStatus);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div style={{ width: '100%', height: isMobile ? 350 : 300 }}>
            {/* Título informativo opcional para reemplazar la leyenda */}
            <h6>Registros por estado</h6>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={chartData}
                    // Aumentamos top a 30 para que el LabelList no se corte
                    margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 15 }}
                        interval={0} 
                    />
                    <YAxis allowDecimals={false} hide={isMobile} />
                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        formatter={(value) => [value, "Cantidad"]}
                    />
                    
                    {/* Quitamos <Legend /> para eliminar el cuadro negro */}
                    
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <LabelList 
                            dataKey="value" 
                            position="top" 
                            style={{ fill: '#666', fontSize: '15px', fontWeight: 'bold' }} 
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default InteractiveStateBarChart;