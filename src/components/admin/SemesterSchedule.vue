<template>
  <div class="exam-schedule-management">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Semester Schedule Management</h1>
        <button class="toggle-form-btn" @click="toggleForm">
          <i v-if="!showForm" class="fas fa-plus"></i>
          <i v-else class="fas fa-times"></i>
          {{ showForm ? "Close" : "Add Semester Schedule" }}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div v-if="showForm" class="form-container">
        <form @submit.prevent="submitForm" class="elegant-form">
          <div class="form-group">
            <label for="semesterName">Semester Name</label>
            <input
              type="text"
              id="semesterName"
              v-model="form.semesterName"
              class="form-control"
              placeholder="Enter semester name"
              required
            />
          </div>

          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              v-model="form.startDate"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              v-model="form.endDate"
              class="form-control"
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="toggleForm">
              Cancel
            </button>
            <button type="submit" class="btn-success">
              {{ isEditing ? "Update" : "Submit" }}
            </button>
          </div>
        </form>
      </div>

      <!-- List Header -->
      <div class="list-header">
        <h2>All Semester Schedules</h2>
        <div class="search-container">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Semester Schedule Table -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Semester Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="schedule in filteredSchedules" :key="schedule.id">
              <td>{{ schedule.id }}</td>
              <td>{{ schedule.semesterName }}</td>
              <td>{{ formatDate(schedule.startDate) }}</td>
              <td>{{ formatDate(schedule.endDate) }}</td>
              <td class="action-cell">
                <button class="btn-warning" @click="editSchedule(schedule)">
                  Edit
                </button>
                <button class="btn-danger" @click="deleteSchedule(schedule.id)">
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredSchedules.length === 0">
              <td colspan="5" class="no-data">No Semester Schedules Found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted, computed } from "vue";

export default {
  name: "SemesterScheduleManagement",
  setup() {
    const baseURL = "http://localhost:8081/api/v1/semester-schedule";

    const schedules = ref([]);
    const showForm = ref(false);
    const isEditing = ref(false);
    const form = ref({
      id: null,
      semesterName: "",
      startDate: "",
      endDate: "",
    });
    const searchQuery = ref("");

    // Fetch all semester schedules
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${baseURL}/getAllSemesterSchedules`);
        schedules.value = response.data;
        console.log("Fetched schedules:", schedules.value); // Debugging line
      } catch (error) {
        console.error("Error fetching semester schedules:", error);
        alert("Failed to fetch semester schedules. Please try again later.");
      }
    };

    // Toggle the form visibility
    const toggleForm = () => {
      showForm.value = !showForm.value;
      if (!showForm.value) {
        resetForm();
      }
    };

    // Reset the form
    const resetForm = () => {
      form.value = {
        id: null,
        semesterName: "",
        startDate: "",
        endDate: "",
      };
      isEditing.value = false;
    };

    // Submit the form (Add or Update)
    const submitForm = async () => {
      try {
        if (isEditing.value) {
          // Update existing schedule
          console.log(`Updating SemesterSchedule with ID: ${form.value.id}`); // Debugging line
          const response = await axios.put(
            `${baseURL}/updateSemesterScheduleById/${form.value.id}`,
            form.value
          );
          console.log("Update response:", response); // Debugging line
          alert("Semester Schedule updated successfully!");
        } else {
          // Add new schedule
          console.log("Adding new SemesterSchedule:", form.value); // Debugging line
          const response = await axios.post(
            `${baseURL}/addSemesterSchedule`,
            form.value
          );
          console.log("Add response:", response); // Debugging line
          alert("Semester Schedule added successfully!");
        }
        fetchSchedules();
        toggleForm();
      } catch (error) {
        console.error("Error submitting form:", error);
        if (error.response) {
          // Server responded with a status other than 2xx
          alert(`Error: ${error.response.data}`);
        } else if (error.request) {
          // Request was made but no response received
          alert("No response from server. Please try again later.");
        } else {
          // Something else happened
          alert("An unexpected error occurred.");
        }
      }
    };

    // Edit a schedule
    const editSchedule = (schedule) => {
      form.value = { ...schedule };
      isEditing.value = true;
      showForm.value = true;
      console.log("Editing schedule:", form.value); // Debugging line
    };

    // Delete a schedule
    const deleteSchedule = async (id) => {
      if (confirm("Are you sure you want to delete this semester schedule?")) {
        try {
          console.log(`Attempting to delete SemesterSchedule with ID: ${id}`); // Debugging line
          const response = await axios.delete(
            `${baseURL}/deleteSemesterScheduleById/${id}`
          );
          console.log("Delete response:", response); // Debugging line
          alert("Semester Schedule deleted successfully!");
          fetchSchedules();
        } catch (error) {
          console.error("Error deleting schedule:", error);
          if (error.response) {
            // Server responded with a status other than 2xx
            alert(`Error: ${error.response.data}`);
          } else if (error.request) {
            // Request was made but no response received
            alert("No response from server. Please try again later.");
          } else {
            // Something else happened
            alert("An unexpected error occurred.");
          }
        }
      }
    };

    // Format date to a readable format
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    };

    // Computed property for search functionality
    const filteredSchedules = computed(() => {
      if (!searchQuery.value) {
        return schedules.value;
      }
      return schedules.value.filter((schedule) =>
        Object.values(schedule).some((val) =>
          String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      );
    });

    onMounted(() => {
      fetchSchedules();
    });

    return {
      schedules,
      showForm,
      toggleForm,
      form,
      submitForm,
      isEditing,
      editSchedule,
      deleteSchedule,
      searchQuery,
      filteredSchedules,
      formatDate,
    };
  },
};
</script>

<style scoped>
/* Reusing your provided CSS styles */

/* Global Styles */
.exam-schedule-management {
  font-family: "Inter", "Segoe UI", Roboto, Arial, sans-serif;
  background-color: #f4f6f9; /* Direct color code */
  color: #2c3e50; /* Direct color code */
  min-height: 100vh;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dfe6e9;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #2c3e50; /* Direct color code */
}

/* Add and Close Toggle Button */
.toggle-form-btn {
  background-color: #4a90e2; /* Direct primary color */
  color: #ffffff; /* White text */
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Direct box-shadow */
  transition: background-color 0.3s, transform 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-form-btn i {
  font-size: 18px;
}

.toggle-form-btn:hover {
  background-color: #357ab8; /* Darker shade of primary */
  transform: translateY(-2px);
}

/* Form Styles */
.form-container {
  background-color: #ffffff; /* White background */
  border-radius: 8px; /* Direct border-radius */
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Direct box-shadow */
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease-in-out;
}

.elegant-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e; /* Direct secondary color */
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #34495e; /* Direct secondary color */
  opacity: 0.7;
  font-size: 16px;
}

.form-control {
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: 1px solid #ced6e0; /* Direct border color */
  border-radius: 8px; /* Direct border-radius */
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  border-color: #4a90e2; /* Direct primary color */
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.2); /* Direct box-shadow */
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

/* Secondary Button (Cancel) */
.btn-secondary {
  background-color: #95a5a6; /* Direct color code */
  color: #ffffff; /* White text */
  padding: 10px 20px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.btn-secondary:hover {
  background-color: #7f8c8d; /* Darker shade */
  transform: translateY(-2px);
}

/* Success Button (Submit/Update) */
.btn-success {
  background-color: #2ecc71; /* Direct success color */
  color: #ffffff; /* White text */
  padding: 10px 20px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.btn-success:hover {
  background-color: #27ae60; /* Darker shade */
  transform: translateY(-2px);
}

/* Table Styles */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.list-header h2 {
  font-size: 24px;
  color: #2c3e50; /* Direct color code */
}

.search-container {
  position: relative;
}

.search-container i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #34495e; /* Direct secondary color */
  opacity: 0.7;
  font-size: 18px;
}

.search-input {
  width: 280px;
  padding: 10px 14px 10px 40px;
  border: 1px solid #ced6e0; /* Direct border color */
  border-radius: 8px; /* Direct border-radius */
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-input:focus {
  border-color: #4a90e2; /* Direct primary color */
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.2); /* Direct box-shadow */
  outline: none;
}

.table-responsive {
  background-color: #ffffff; /* White background */
  border-radius: 8px; /* Direct border-radius */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Direct box-shadow */
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 18px 20px;
  border-bottom: 1px solid #dfe6e9; /* Direct border color */
  text-align: left;
  font-size: 16px;
}

.table th {
  background-color: #f8f9fa; /* Direct background color */
  font-weight: 600;
  text-transform: uppercase;
  color: #34495e; /* Direct secondary color */
  font-size: 14px;
}

.table tbody tr:hover {
  background-color: #f1f2f6; /* Direct hover color */
}

.action-cell {
  display: flex;
  gap: 10px;
}

/* Warning Button (Edit) */
.btn-warning {
  background-color: #f39c12; /* Direct warning color */
  color: #ffffff; /* White text */
  padding: 8px 12px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.btn-warning:hover {
  background-color: #d35400; /* Darker shade */
  transform: translateY(-2px);
}

/* Danger Button (Delete) */
.btn-danger {
  background-color: #e74c3c; /* Direct danger color */
  color: #ffffff; /* White text */
  padding: 8px 12px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.btn-danger:hover {
  background-color: #c0392b; /* Darker shade */
  transform: translateY(-2px);
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #7f8c8d; /* Direct color code */
  font-style: italic;
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
  .search-input {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .search-input {
    width: 100%;
  }

  .action-cell {
    flex-direction: column;
    gap: 8px;
  }

  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-actions .btn-secondary,
  .modal-actions .btn-success {
    width: 100%;
  }
}
</style>
