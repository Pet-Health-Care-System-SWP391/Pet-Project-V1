import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from "@mui/material";
import { getDatabase, ref, set } from "firebase/database";
import { toast } from 'react-toastify';

const Services = () => {
  const initialServiceState = {
    name: '',
    price: 0,
    image: '',
    description: ''
  };

  const [service, setService] = useState(initialServiceState);
  const db = getDatabase();
  
  const addService = (service) => {
    const newServiceRef = ref(db, 'services/' + service.name);
    return set(newServiceRef, service);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService({
      ...service,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addService(service).then(() => {
      toast.success("Service added successfully!");
      setService(initialServiceState);  // Reset the form to initial state
    }).catch((error) => {
      toast.error("Failed to add service: " + error.message);  // Changed alert to toast for consistency
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Add Service
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={service.name}
            onChange={handleChange}
            required
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={service.price}
            onChange={handleChange}
            required
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Image URL"
            name="image"
            value={service.image}
            onChange={handleChange}
            required
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={service.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Add Service
        </Button>
      </form>
    </Box>
  );
};

export default Services;
