import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts';

// Colores consistentes para los plazos
const ZONE_COLORS = {
    'VIP': '#b07aa1',
    'PATIOS': '#FF8042',
    'DOMICILIO': '#FFBB28',
    /* 'Plazo 30': '#FF8042', */
};

// ----------------------------------------------------
// Función para procesar y filtrar datos
// ----------------------------------------------------
const useChartData = (data, zone) => {
    return useMemo(() => {
        // 1. Filtrar por coId si se selecciona uno
        const filteredData = zone 
            ? data.filter(item => item.zone === zone)
            : data;

        // 2. Contar la frecuencia de cada plazo en los datos filtrados
        const counts = filteredData.reduce((acc, item) => {
            const zoneKey = `${item.zone}`;
            acc[zoneKey] = (acc[zoneKey] || 0) + 1;
            return acc;
        }, {});

        // 3. Convertir a formato Recharts, aplicando colores y nombres
        const chartData = Object.keys(counts).map(key => ({
            name: key, 
            value: counts[key],
            color: ZONE_COLORS[key] || '#999999' // Usar color predefinido o gris
        }));
        
        return { chartData, totalRecords: filteredData.length };
    }, [data, zone]); // Se recalcula si cambian los datos o el coId
};

// ----------------------------------------------------
// Función auxiliar para obtener las opciones del SELECT
// ----------------------------------------------------
const getCoIdOptions = (data) => {
    // Usamos un Set para obtener solo IDs únicos
    const uniqueCoIds = new Set(data.map(item => `${item.coId} - ${item.coDescription}`));
    
    // Convertir el Set en un array de objetos para el select
    return [{ value: '', label: 'Todas las Agencias (Total)' }, ...Array.from(uniqueCoIds).map(str => {
        const [coId, coDescription] = str.split(' - ');
        return { value: coId, label: `${coId} - ${coDescription}` };
    })];
};


// ----------------------------------------------------
// Componente principal
// ----------------------------------------------------
const InteractiveZoneDonutChart = ({ suggestions , selectedZone }) => {
    /* const [selectedCoId, setSelectedCoId] = useState(''); */
    const zone = ((selectedZone !== null || selectedZone !== '') && selectedZone !== 'todos') ? selectedZone.toUpperCase() : null
    const { chartData, totalRecords } = useChartData(suggestions, zone);
    
    // Obtener las opciones de las agencias
    const coIdOptions = useMemo(() => getCoIdOptions(suggestions), [suggestions]);

    // Función de etiquetado para el gráfico
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '12px' }}>
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        );
    };

    // 🔹 Detectar si es pantalla pequeña
      const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
      useEffect(() => {
          const handleResize = () => setIsMobile(window.innerWidth < 768);
          window.addEventListener("resize", handleResize);
          return () => window.removeEventListener("resize", handleResize);
      }, []);

    return (
        <div style={{ width: '100%', height: isMobile ? 310 : 250 }}>
            {/* Gráfico de Anillo */}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} // Radio Interior (Crea el hueco)
                        outerRadius={100} // Radio Exterior
                        labelLine={false}
                        label={renderCustomizedLabel}
                    >
                        {/* Celdas para aplicar el color */}
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                        
                    {/* Texto central opcional (Total de Registros) */}
                    <text 
                        x="50%" 
                        y="45%" 
                        textAnchor="middle" 
                        dominantBaseline="central" 
                        style={{ fontSize: '20px', fontWeight: 'bold' }}
                    >
                        Total: {totalRecords}
                    </text>
                        
                    <Tooltip 
                        formatter={(value, name) => [`${value}`, name]}
                    />
                    <Legend verticalAlign="bottom" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default InteractiveZoneDonutChart;