import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  Typography,
  Divider,
  Box,
  Grid,
} from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import dayjs from "dayjs";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useInitializeDatabase } from "../hooks/useInitializeDatabase.ts";
import { v4 as uuidv4 } from 'uuid';

interface Medicine {
  id: string;  // Change to string since uuid is a string
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

interface WholesalerPurchase {
  id: number;
  wholesalerName: string;
  purchaseDate: string;
  medicines: Medicine[];
}

const PharmacyStockUpdate: React.FC<{ userId: string }> = ({ userId }) => {
  const [purchases, setPurchases] = useState<WholesalerPurchase[]>([
    {
      id: 1,
      wholesalerName: "",
      purchaseDate: dayjs().format("YYYY-MM-DD"),
      medicines: [
        {
          id: uuidv4(), // Generate unique ID for each medicine at start
          name: "",
          batchNumber: "",
          expiryDate: "",
          quantity: 0,
          purchasePrice: 0,
          sellingPrice: 0,
        },
      ],
    },
  ]);

  const { initializeDatabase } = useInitializeDatabase();

  // Initialize database for the user when component mounts
  useEffect(() => {
    if (!userId) {
      toast.error("User ID is missing. Please log in first.");
      return;
    }
    initializeDatabase(userId);
  }, [initializeDatabase, userId]);

  // Update wholesaler or purchase date fields
  const handlePurchaseChange = (
    id: number,
    field: keyof WholesalerPurchase,
    value: string
  ) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === id ? { ...purchase, [field]: value } : purchase
      )
    );
  };

  // Update medicine details within a specific purchase
  const handleMedicineChange = (
    purchaseId: number,
    medicineId: string,  // id is now a string (UUID)
    field: keyof Medicine,
    value: string | number
  ) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? {
              ...purchase,
              medicines: purchase.medicines.map((medicine) =>
                medicine.id === medicineId
                  ? { ...medicine, [field]: value }
                  : medicine
              ),
            }
          : purchase
      )
    );
  };

  // Add a new medicine row
  const addMedicine = (purchaseId: number) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? {
              ...purchase,
              medicines: [
                ...purchase.medicines,
                {
                  id: uuidv4(),  // Generate a unique id for each new medicine
                  name: "",
                  batchNumber: "",
                  expiryDate: "",
                  quantity: 0,
                  purchasePrice: 0,
                  sellingPrice: 0,
                },
              ],
            }
          : purchase
      )
    );
  };

  // Remove a medicine row
  const removeMedicine = (purchaseId: number, medicineId: string) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? {
              ...purchase,
              medicines: purchase.medicines.filter(
                (medicine) => medicine.id !== medicineId
              ),
            }
          : purchase
      )
    );
  };

  // Submit purchases to the database
  const handleSubmit = async () => {
    try {
      for (const purchase of purchases) {
        for (const medicine of purchase.medicines) {
          const { id, ...medicineData } = medicine;

          await invoke("insert_medicine", {
            userId,
            _id: id,  // Pass the unique _id
            ...medicineData, // Pass other fields
            wholesalerName: purchase.wholesalerName,
            purchaseDate: purchase.purchaseDate,
          });
        }
      }
      toast.success("Medicines added successfully!");
      setPurchases([
        {
          id: 1,
          wholesalerName: "",
          purchaseDate: dayjs().format("YYYY-MM-DD"),
          medicines: [
            {
              id: uuidv4(), // Generate a unique id for the new medicine row
              name: "",
              batchNumber: "",
              expiryDate: "",
              quantity: 0,
              purchasePrice: 0,
              sellingPrice: 0,
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Error adding medicines:", error);
      toast.error("Failed to add medicines.");
    }
  };

  return (
    <Box className="p-6 mx-auto bg-white shadow-lg rounded-lg">
      <Typography variant="h4" className="text-center font-bold mb-8">
        Pharmacy Stock Update
      </Typography>

      {purchases.map((purchase) => (
        <Box key={purchase.id} className="mb-10">
          {/* Wholesaler Details */}
          <Grid container spacing={2} className="mb-6">
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wholesaler Name"
                value={purchase.wholesalerName}
                onChange={(e) =>
                  handlePurchaseChange(purchase.id, "wholesalerName", e.target.value)
                }
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Purchase Date"
                type="date"
                value={purchase.purchaseDate}
                onChange={(e) =>
                  handlePurchaseChange(purchase.id, "purchaseDate", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Medicines */}
          <Typography variant="h6" className="font-semibold mb-4">
            Medicines List
          </Typography>
          {purchase.medicines.map((medicine) => (
            <Grid
              key={medicine.id}
              container
              spacing={2}
              className="mb-4 items-center"
            >
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Medicine Name"
                  value={medicine.name}
                  onChange={(e) =>
                    handleMedicineChange(purchase.id, medicine.id, "name", e.target.value)
                  }
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Batch Number"
                  value={medicine.batchNumber}
                  onChange={(e) =>
                    handleMedicineChange(purchase.id, medicine.id, "batchNumber", e.target.value)
                  }
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Expiry Date"
                  type="date"
                  value={medicine.expiryDate}
                  onChange={(e) =>
                    handleMedicineChange(purchase.id, medicine.id, "expiryDate", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={medicine.quantity}
                  onChange={(e) =>
                    handleMedicineChange(purchase.id, medicine.id, "quantity", +e.target.value)
                  }
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Purchase Price"
                  type="number"
                  value={medicine.purchasePrice}
                  onChange={(e) =>
                    handleMedicineChange(purchase.id, medicine.id, "purchasePrice", +e.target.value)
                  }
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Selling Price"
                  type="number"
                  value={medicine.sellingPrice}
                  onChange={(e) =>
                    handleMedicineChange(purchase.id, medicine.id, "sellingPrice", +e.target.value)
                  }
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton
                  onClick={() => removeMedicine(purchase.id, medicine.id)}
                  color="error"
                >
                  <DeleteOutline />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={() => addMedicine(purchase.id)}
            className="mb-4"
          >
            Add Medicine
          </Button>
          <Divider className="my-6" />
        </Box>
      ))}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        className="mt-6"
      >
        Confirm Purchase
      </Button>
    </Box>
  );
};

export default PharmacyStockUpdate;
