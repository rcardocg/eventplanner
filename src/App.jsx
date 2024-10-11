import { useEffect, useState } from 'react';
import { Card, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box, Select, MenuItem, useMediaQuery, Button, Modal, TextField } from '@mui/material';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from "./firebaseconfig";
import { useTheme } from '@mui/material/styles';

export default function App() {
  const [data, setData] = useState([]);
  const [filterTrack, setFilterTrack] = useState('');
  const [tracks, setTracks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ nombre: '', expo: '', hora: '', track: '', estado: 'No ha comenzado' });
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingEvent(null);
    setNewEvent({ nombre: '', expo: '', hora: '', track: '', estado: 'No ha comenzado' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async () => {
    try {
      if (editingEvent) {
        const eventRef = doc(db, 'devfest', editingEvent.id);
        await updateDoc(eventRef, newEvent);
      } else {
        await addDoc(collection(db, 'devfest'), newEvent);
      }
      handleClose();
    } catch (error) {
      console.error("Error al agregar o actualizar el evento: ", error);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent(event);
    handleOpen();
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'devfest', eventId);
      await deleteDoc(eventRef);
    } catch (error) {
      console.error("Error al eliminar el evento: ", error);
    }
  };

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

      <Button variant="contained" color="primary" onClick={handleOpen}>
        Crear Evento
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'background.paper', p: 4, boxShadow: 24, borderRadius: 2 
        }}>
          <Typography variant="h6" gutterBottom>
            {editingEvent ? "Editar evento" : "Crear nuevo evento"}
          </Typography>
          <TextField
            label="Nombre"
            name="nombre"
            value={newEvent.nombre}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Expositor"
            name="expo"
            value={newEvent.expo}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Hora"
            name="hora"
            value={newEvent.hora}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Track"
            name="track"
            value={newEvent.track}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleAddEvent} sx={{ mt: 2 }}>
            {editingEvent ? "Guardar cambios" : "Agregar Evento"}
          </Button>
        </Box>
      </Modal>

      <Box sx={{ overflowX: 'auto', mt: 2 }}>
        <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Expositor</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Track</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
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
                      <MenuItem value="Finalizado">Finalizado</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" onClick={() => handleEditEvent(item)}>
                      Editar
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleDeleteEvent(item.id)} sx={{ ml: 1 }}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>No hay tracks</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
