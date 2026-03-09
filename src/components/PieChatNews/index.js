import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts';

// Definimos los colores para las categorías
const NEWS_COLORS = {
    'Con evidencia': '#0088FE',    // Para item.news === true
    'Sin evidencia': '#FF8042', // Para item.news === false
};

const InteractiveNewsDonutChart = ({ suggestions = [] }) => {
    // ----------------------------------------------------
    // Procesamiento de datos: Contar True y False
    // ----------------------------------------------------
    const { chartData, totalRecords } = useMemo(() => {
        const counts = suggestions.reduce((acc, item) => {
            // Clasificamos cada registro basándonos en el booleano 'news'
            const label = item.news === true ? 'Con evidencia' : 'Sin evidencia';
            acc[label] = (acc[label] || 0) + 1;
            return acc;
        }, { 'Con evidencia': 0, 'Sin evidencia': 0 }); // Inicializamos en 0 ambos

        const dataFormatted = Object.keys(counts).map(key => ({
            name: key, 
            value: counts[key],
            color: NEWS_COLORS[key]
        }));
        
        return { 
            chartData: dataFormatted, 
            totalRecords: suggestions.length 
        };
    }, [suggestions]);

    // ----------------------------------------------------
    // Configuración visual y Responsive
    // ----------------------------------------------------
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent === 0) return null; // No mostrar etiqueta si el valor es 0%

        return (
          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 'bold' }}>
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        );
    };

    return (
        <div style={{ width: '100%', height: isMobile ? 310 : 250 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={100} 
                        labelLine={false}
                        label={renderCustomizedLabel}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                        
                    <text 
                        x="50%" 
                        y="45%" 
                        textAnchor="middle" 
                        dominantBaseline="central" 
                        style={{ fontSize: '20px', fontWeight: 'bold' }}
                    >
                        Total: {totalRecords}
                    </text>
                        
                    <Tooltip formatter={(value) => [value, "Registros"]} />
                    <Legend verticalAlign="bottom" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default InteractiveNewsDonutChart;