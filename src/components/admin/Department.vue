
<template>
  <div class="department-management">
    <div class="dept-container">
      <!-- Header Section -->
      <div class="dept-header">
        <h1>Departments</h1>
        <!-- Add Department Button -->
        <button class="dept-toggle-btn" @click="openAddModal">
          Add Department
        </button>
      </div>

      <!-- Departments Table -->
      <div class="dept-table-responsive">
        <table class="dept-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Level</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="department in departments" :key="department.id">
              <td>{{ department.id }}</td>
              <td>{{ department.name || "No Name"}}</td>
              <td>{{ department.description || "No description" }}</td>
              <td>{{ department.level || "No Level" }}</td>
              <td>{{ formatDate(department.createdAt) }}</td>
              <td>{{ formatDate(department.updatedAt) }}</td>
              <td class="dept-action-cell">
                <button class="dept-btn-edit" @click="openEditModal(department)">
                  Edit
                </button>
                <button class="dept-btn-delete" @click="confirmDelete(department.id)">
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="departments.length === 0">
              <td colspan="7" class="dept-no-data">No departments available.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal for Add/Update Department -->
      <div v-if="isModalOpen" class="dept-form-container">
        <h3>{{ modalTitle }}</h3>
        <form @submit.prevent="submitForm" class="dept-elegant-form">
          <div class="dept-form-group">
            <label for="department-name">Department Name</label>
            <input
              v-model="departmentForm.name"
              type="text"
              id="department-name"
              class="dept-form-control"
              placeholder="Enter Department Name"
              required
            />
          </div>
          <div class="dept-form-group">
            <label for="department-description">Department Description</label>
            <textarea
              v-model="departmentForm.description"
              id="department-description"
              class="dept-form-control"
              placeholder="Enter Department Description"
              rows="3"
            ></textarea>
          </div>
          <div class="dept-form-group">
            <label for="department-level">Department Level</label>
            <input
              v-model="departmentForm.level"
              type="number"
              id="department-level"
              class="dept-form-control"
              placeholder="Enter Department Level"
              required
            />
          </div>
          <div class="dept-modal-actions">
            <button type="button" class="dept-btn-cancel" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="dept-btn-submit">
              {{ modalButtonText }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// Reactive state for department data
const departments = ref([]);
const departmentForm = ref({
  name: "",
  description: "",
  level: "",
  createdAt: null,
  updatedAt: null
});
const isModalOpen = ref(false);
const modalTitle = ref("Add Department");
const modalButtonText = ref("Add");
const departmentToDelete = ref(null); // To store the department that needs to be deleted

// Base API URL
const API_URL = "http://localhost:8081/api/v1/department";

// Fetch departments on mount
onMounted(() => {
  fetchDepartments();
});

// Fetch departments from the backend API
const fetchDepartments = async () => {
  try {
    const response = await axios.get(`${API_URL}/getAllDepartments`);
    departments.value = response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    alert("Failed to fetch departments. Please try again.");
  }
};

// Open Add Modal
const openAddModal = () => {
  departmentForm.value = {
    name: "",
    description: "",
    level: "",
    createdAt: null,
    updatedAt: null
  }; // Reset form
  modalTitle.value = "Add Department";
  modalButtonText.value = "Add";
  isModalOpen.value = true;
};

// Open Edit Modal
const openEditModal = (department) => {
  departmentForm.value = {
    ...department,
    description: department.description || "",
  }; // Pre-fill form with department data
  modalTitle.value = "Edit Department";
  modalButtonText.value = "Update";
  isModalOpen.value = true;
};

// Submit Add or Update Department
const submitForm = async () => {
  if (modalButtonText.value === "Add") {
    await addDepartment();
  } else {
    await updateDepartment(departmentForm.value.id);
  }
  closeModal(); // Close the modal after submitting the form
  fetchDepartments(); // Refresh the department list
};

// Add a new department
const addDepartment = async () => {
  try {
    await axios.post(`${API_URL}/addDepartment`, departmentForm.value);
  } catch (error) {
    console.error("Error adding department:", error);
    alert("Failed to add department. Please try again.");
  }
};

// Update an existing department
const updateDepartment = async (id) => {
  try {
    await axios.put(
      `${API_URL}/updateDepartmentById/${id}`,
      departmentForm.value
    );
  } catch (error) {
    console.error("Error updating department:", error);
    alert("Failed to update department. Please try again.");
  }
};

// Confirm deletion
const confirmDelete = (id) => {
  if (window.confirm("Are you sure you want to delete this department?")) {
    deleteDepartment(id);
  }
};

// Delete a department by ID
const deleteDepartment = async (id) => {
  try {
    await axios.delete(`${API_URL}/deleteDepartmentById/${id}`);
    fetchDepartments(); // Refresh the department list
  } catch (error) {
    console.error("Error deleting department:", error);
    alert("Failed to delete department. Please try again.");
  }
};

// Close the modal
const closeModal = () => {
  isModalOpen.value = false;
};

// Format date as 'YYYY-MM-DD'
const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};
</script>



<style scoped>
/* Global Styles */
.department-management {
  font-family: "Inter", "Segoe UI", Roboto, Arial, sans-serif;
  background-color: #f4f6f9;
  color: #2c3e50;
  min-height: 100vh;
  padding: 40px 0;
}

.dept-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Header Styles */
.dept-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dfe6e9;
}

.dept-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

/* Add Department Button */
.dept-toggle-btn {
  background-color: #4a90e2;
  color: #ffffff;
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, transform 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dept-toggle-btn:hover {
  background-color: #357ab8;
  transform: translateY(-2px);
}

/* Table Styles */
.dept-table-responsive {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.dept-table {
  width: 100%;
  border-collapse: collapse;
}

.dept-table th,
.dept-table td {
  padding: 18px 20px;
  border-bottom: 1px solid #dfe6e9;
  text-align: left;
  font-size: 16px;
}

.dept-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  text-transform: uppercase;
  color: #34495e;
  font-size: 14px;
}

.dept-table tbody tr:hover {
  background-color: #f1f2f6;
}

.dept-action-cell {
  display: flex;
  gap: 10px;
}

.dept-no-data {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
}

/* Button Styles */

/* Edit Button */
.dept-btn-edit {
  background-color: #f39c12;
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.dept-btn-edit:hover {
  background-color: #d35400;
  transform: translateY(-2px);
}

/* Delete Button */
.dept-btn-delete {
  background-color: #e74c3c;
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.dept-btn-delete:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

/* Secondary Button (Cancel) */
.dept-btn-cancel {
  background-color: #95a5a6;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.dept-btn-cancel:hover {
  background-color: #7f8c8d;
  transform: translateY(-2px);
}

/* Success Button (Submit/Update) */
.dept-btn-submit {
  background-color: #2ecc71;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.dept-btn-submit:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
}

/* Form Styles */
.dept-form-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease-in-out;
}

.dept-elegant-form {
  display: flex;
  flex-direction: column;
}

.dept-form-group {
  margin-bottom: 25px;
}

.dept-form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e;
}

.dept-form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ced6e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.dept-form-control:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.2);
  outline: none;
}

.dept-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

/* Transitions and Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 992px) {
  .dept-toggle-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .dept-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .dept-table-responsive {
    overflow-x: scroll;
  }

  .dept-action-cell {
    flex-direction: column;
    gap: 8px;
  }

  .dept-modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .dept-modal-actions .dept-btn-cancel,
  .dept-modal-actions .dept-btn-submit {
    width: 100%;
  }
}
</style>
