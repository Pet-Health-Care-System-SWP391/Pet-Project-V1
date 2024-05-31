import React, { useState, useEffect } from "react";
import { auth } from "../../../Components/firebase/firebase";
import { updateProfile } from "firebase/auth";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";

import {
  Box,
  Typography,
  useTheme,
  Button,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { mockDataTeam } from "../../data/mockData"; // Replace with your actual user data
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import MedicationIcon from "@mui/icons-material/Medication";
import Header from "../../../Components/dashboardChart/Header";

const RoleEditCell = ({ id, value, api }) => {
  const [role, setRole] = useState(value);

  const handleChange = (event) => {
    setRole(event.target.value);
    api.setEditCellValue({
      id: id,
      field: "role",
      value: event.target.value,
    });
  };

  return (
    <div className="role-menu">
      <Select value={role} onChange={handleChange} autoFocus fullWidth>
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem value="user">User</MenuItem>
        <MenuItem value="manager">Manager</MenuItem>
        <MenuItem value="veterinarian">Vet</MenuItem>
      </Select>
    </div>
  );
};

function Team() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [userUpdated, setUserUpdated] = useState(false); // Track user updates
  const user = auth.currentUser;
  const [rows, setRows] = useState(mockDataTeam);
  const [searchQuery, setSearchQuery] = useState("");

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^\d{10}$/; // Only allow 10 digits
    return re.test(phone);
  };

  const checkDuplicateData = (row) => {
    return rows.some((item) => {
      if (item.id !== row.id) {
        return (
          item.email === row.email ||
          item.phone === row.phone ||
          item.username === row.username
        );
      }
      return false;
    });
  };

  const handleSubmit = async (event, row) => {
    event.preventDefault();
    setLoading(true);

    let isValid = true;
    const updates = {};
    if (row.email) {
      if (!validateEmail(row.email)) {
        isValid = false;
        toast.error("Invalid email"); // Invalid email message in Vietnamese
      } else {
        updates.email = row.email;
        localStorage.setItem("email", row.email);
      }
    }
    if (row.username) {
      updates.username = row.username;
      localStorage.setItem("username", row.username);
    }
    if (row.accountBalance) {
      updates.accountBalance = row.accountBalance;
      localStorage.setItem("accountBalance", row.accountBalance);
    }
    if (row.phone) {
      if (!validatePhone(row.phone)) {
        isValid = false;
        toast.error("Phone number must be 10 digits"); // Phone number must be 10 digits message in Vietnamese
      } else {
        updates.phone = row.phone;
      }
    }
    if (row.address) {
      updates.address = row.address;
    }
    if (row.fullname) {
      updates.fullname = row.fullname;
    }

    if (isValid && Object.keys(updates).length > 0) {
      const isDuplicateEmailUsernamePhone = checkDuplicateData(row);
      if (isDuplicateEmailUsernamePhone) {
        toast.error("Dữ liệu trùng lặp email, username hoặc số điện thoại"); // Duplicate email, username or phone number error message in Vietnamese
        setLoading(false);
        return;
      }

      try {
        // Update profile of the user being edited (not the current user)
        await updateProfile(auth.currentUser, {
          phone: row.phone,
          address: row.address,
          fullname: row.fullname,
          role: row.role,
        });

        // Update user data in the database
        await update(ref(getDatabase(), `users/${row.id}`), updates);
        setRows(rows.map((item) => (item.id === row.id ? row : item))); // Update row in state
        setUserUpdated(true);
        toast.success("Updated successful !!!"); // Update successful message in Vietnamese
      } catch (error) {
        toast.error("Error"); // Error message in Vietnamese
      }
    } else if (!isValid) {
      toast.warning("Please check all the input fields"); // Check input message in Vietnamese
    } else {
      toast.warning("Nothing changed"); // No changes message in Vietnamese
    }
    setLoading(false);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredRows = rows.filter((row) =>
    row.email && row.email.toLowerCase().includes(searchQuery)
  );

  const columns = [
    { field: "id", headerName: "ID", width: 150, editable: false },
    { field: "username", headerName: "Username", flex: 1, editable: true },
    { field: "phone", headerName: "Phone Number", flex: 0.8, editable: true },
    { field: "email", headerName: "Email", flex: 1, editable: true },
    {
      field: "accountBalance",
      headerName: "Balance",
      flex: 0.8,
      editable: true,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: ({ value }) => {
        return (
          <Box
            width="80%"
            p="5px"
            margin=".6rem"
            display="flex"
            justifyContent="center"
            backgroundColor={
              value === "admin"
                ? colors.blueAccent[500]
                : colors.blueAccent[500]
            }
            borderRadius="4px"
          >
            {value === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {value === "manager" && <SecurityOutlinedIcon />}
            {value === "user" && <LockOpenOutlinedIcon />}
            {value === "veterinarian" && <MedicationIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {value}
            </Typography>
          </Box>
        );
      },
      editable: true,
      renderEditCell: (params) => <RoleEditCell {...params} />,
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <div className="admin-update-button">
          <Button
            variant="contained"
            size="small"
            onClick={(event) => handleSubmit(event, params.row)}
          >
            Update
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="USERS" subtitle="Managing the User Members" />
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase
          sx={{ ml: 2, flex: 1 }}
          placeholder="Search by email"
          value={searchQuery}
          onChange={handleSearch}
        />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={filteredRows} // Use the filtered rows
          columns={columns}
        />
      </Box>
    </Box>
  );
}

export default Team;
