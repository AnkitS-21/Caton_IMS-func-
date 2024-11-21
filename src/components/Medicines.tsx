import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import authentication context

interface Medicine {
  id: string; // MongoDB IDs are strings
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  wholesalerName: string;
  purchaseDate: string;
}

const ShowMedicines: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { userId, isLoggedIn } = useAuth(); // Use auth context
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      toast.error("User not logged in. Redirecting...");
      navigate("/login"); // Redirect to login page if not authenticated
      return;
    }

    const fetchMedicines = async () => {
      try {
        setLoading(true); // Show loading indicator
        const fetchedMedicines = await invoke<Medicine[]>("get_medicine", { userId });
        setMedicines(fetchedMedicines);
        toast.success("Medicines loaded successfully!");
      } catch (error) {
        console.error("Error fetching medicines:", error);
        toast.error("Failed to load medicines.");
      } finally {
        setLoading(false); // Hide loading indicator
      }
    };

    fetchMedicines();
  }, [userId, isLoggedIn, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!medicines.length) {
    return (
      <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
        <Typography variant="h4" className="text-center font-bold mb-8">
          Medicines List
        </Typography>
        <Typography variant="body1" className="text-center">
          No medicines available. Please add some medicines to your inventory.
        </Typography>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
      <Typography variant="h4" className="text-center font-bold mb-8">
        Medicines List
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Wholesaler Name</TableCell>
              <TableCell>Purchase Date</TableCell>
              <TableCell>Medicine Name</TableCell>
              <TableCell>Batch Number</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Purchase Price</TableCell>
              <TableCell>Selling Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medicines.map((medicine) => (
              <TableRow key={medicine.id}>
                <TableCell>{medicine.wholesalerName}</TableCell>
                <TableCell>{medicine.purchaseDate}</TableCell>
                <TableCell>{medicine.name}</TableCell>
                <TableCell>{medicine.batchNumber}</TableCell>
                <TableCell>{medicine.expiryDate}</TableCell>
                <TableCell>{medicine.quantity}</TableCell>
                <TableCell>{medicine.purchasePrice}</TableCell>
                <TableCell>{medicine.sellingPrice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ShowMedicines;
