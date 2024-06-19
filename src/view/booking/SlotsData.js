const generateTimeSlots = (startTime, endTime, interval) => {
    const slots = [];
    let currentTime = startTime;
  
    while (currentTime < endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
      slots.push({ timeString, formattedTime });
      currentTime += interval;
    }
  
    return slots;
  };
   