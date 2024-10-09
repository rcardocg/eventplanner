import { useEffect, useState } from 'react';
import { Card, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box, Select, MenuItem, useMediaQuery } from '@mui/material';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from "./firebaseconfig";
import { useTheme } from '@mui/material/styles';

export default function App() {
  const [data, setData] = useState([]);
  const [filterTrack, setFilterTrack] = useState(''); // Estado para almacenar el track seleccionado
  const [tracks, setTracks] = useState([]); // Estado para almacenar los tracks únicos
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'devfest'),
      (querySnapshot) => {
        const dataArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(dataArray);

        // Extraer todos los tracks únicos
        const uniqueTracks = [...new Set(dataArray.map(item => item.track))];
        setTracks(uniqueTracks);
      },
      (error) => {
        console.error("Error: ", error);
        setData([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleEstadoChange = async (eventId, newEstado) => {
    try {
      const eventRef = doc(db, 'devfest', eventId);
      await updateDoc(eventRef, { estado: newEstado });
    } catch (error) {
      console.error("Error al actualizar el estado: ", error);
    }
  };

  const handleTrackFilterChange = (event) => {
    setFilterTrack(event.target.value);
  };

  // Ordenar y filtrar los eventos
  const sortedData = [...data]
    .sort((a, b) => {
      if (a.estado === 'En proceso' && b.estado !== 'En proceso') {
        return -1;
      }
      if (a.estado !== 'En proceso' && b.estado === 'En proceso') {
        return 1;
      }
      return 0;
    })
    .filter(item => filterTrack === '' || item.track === filterTrack);

  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>Eventos</Typography>

      {/* Select para filtrar por track */}
      <Box sx={{ mb: 2 }}>
        <Select
          value={filterTrack}
          onChange={handleTrackFilterChange}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">Todos los Tracks</MenuItem>
          {tracks.map((track) => (
            <MenuItem key={track} value={track}>
              {track}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Expositor</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Track</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.expo}</TableCell>
                  <TableCell>{item.hora}</TableCell>
                  <TableCell>{item.track}</TableCell>
                  <TableCell>
                    <Select
                      value={item.estado}
                      onChange={(e) => handleEstadoChange(item.id, e.target.value)}
                    >
                      <MenuItem value="No ha comenzado">No ha comenzado</MenuItem>
                      <MenuItem value="En proceso">En proceso</MenuItem>
                      <MenuItem value="Atrasado">Finalizado</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>No hay tracks</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
