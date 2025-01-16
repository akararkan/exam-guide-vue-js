<template>
  <div class="container">
    <h1>Exam Hall Management</h1>

    <!-- Admin Controls: Add New Exam Hall -->
    <div v-if="isAdmin" class="admin-section">
      <div class="form-container">
        <h2>Add New Exam Hall</h2>
        <form @submit.prevent="addExamHole">
          <div class="form-grid">
            <div class="form-group">
              <label>Hall Name</label>
              <input v-model="newExamHole.holeName" type="text" required />
            </div>
            <div class="form-group">
              <label>Number</label>
              <input v-model.number="newExamHole.number" type="number" required />
            </div>
            <div class="form-group">
              <label>Capacity</label>
              <input v-model.number="newExamHole.capacity" type="number" required />
            </div>
            <div class="form-group">
              <label>Rows</label>
              <input v-model.number="newExamHole.row" type="number" required />
            </div>
            <div class="form-group">
              <label>Columns</label>
              <input v-model.number="newExamHole.col" type="number" required />
            </div>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? "Adding..." : "Add Exam Hall" }}
          </button>
        </form>
        <p v-if="examHoleMessage" :class="{ success: isExamHoleSuccess, error: !isExamHoleSuccess }">
          {{ examHoleMessage }}
        </p>
      </div>
    </div>

    <!-- Exam Halls List -->
    <div class="table-container">
      <div class="table-header">
        <h2>Exam Halls</h2>
        <div class="button-group">
          <button @click="loadAvailableExamHoles" class="btn btn-success">
            Show Available
          </button>
          <button @click="loadAllExamHoles" class="btn btn-secondary">
            Show All
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Number</th>
            <th>Capacity</th>
            <th>Available Slots</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hall in examHoles" :key="hall.id">
            <td>{{ hall.holeName }}</td>
            <td>{{ hall.number }}</td>
            <td>{{ hall.capacity }}</td>
            <td>{{ hall.availableSlots }}</td>
            <td class="actions">
              <button @click="viewUsers(hall.id)" class="btn-link">
                View Users
              </button>
              <button v-if="isAdmin" @click="openEditModal(hall)" class="btn-link">
                Edit
              </button>
              <button v-if="isAdmin" @click="confirmDeleteHall(hall.id)" class="btn-link delete">
                Delete
              </button>
              <div class="button-group">
                <!-- <button v-if="isAdmin" @click="addAllUsersToHall(hall.id)" class="btn-link add-all">
                  Add All Users
                </button> -->
                <button v-if="isAdmin" @click="openImportModal(hall.id)" class="btn-link import">
                  Import Users
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Users Modal -->
    <div v-if="showUsersModal" class="modal">
      <div class="modal-content">
        <h3>Users in Hall: {{ currentHallName }}</h3>
        <!-- Add User Form -->
        <div v-if="isAdmin" class="add-user-section">
          <h4>Add User to Hall</h4>
          <form @submit.prevent="assignUserToHall">
            <div class="form-group">
              <label>Select User</label>
              <select v-model="selectedUserId" required>
                <option disabled value="">Please select a user</option>
                <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                  {{ user.fname }} {{ user.lname }} ({{ user.email }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Seat Number</label>
              <input v-model="selectedSeatNumber" type="text" placeholder="e.g., A1" required />
            </div>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? "Assigning..." : "Assign User" }}
            </button>
          </form>
          <p v-if="userActionMessage" :class="{ success: isUserActionSuccess, error: !isUserActionSuccess }">
            {{ userActionMessage }}
          </p>
        </div>
        <!-- Users Table -->
        <div class="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Seat Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usersInHall" :key="user.userId">
                <td>{{ user.fname }} {{ user.lname }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.seatNumber }}</td>
                <td>
                  <button @click="openEditUserModal(user)" class="btn-link">
                    Edit
                  </button>
                  <button @click="removeUserFromHall(currentHallId, user.userId)" class="btn-link delete">
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="closeUsersModal" class="btn btn-secondary">
          Close
        </button>
      </div>
    </div>

    <!-- Import Excel Modal -->
    <div v-if="showImportModal" class="modal">
      <div class="modal-content">
        <h3>Import Users for {{ currentHallName }}</h3>
        <div class="import-section">
          <form @submit.prevent="importExcelData">
            <div class="form-group">
              <label>Select Excel File</label>
              <input type="file" @change="handleFileUpload" accept=".xlsx,.xls" required />
              <small>Excel file should contain columns: user_id, seat_number</small>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Importing...' : 'Import Users' }}
            </button>
            <button @click="closeImportModal" type="button" class="btn btn-secondary">
              Cancel
            </button>
          </form>
          <p v-if="importMessage" :class="{ success: isImportSuccess, error: !isImportSuccess }">
            {{ importMessage }}
          </p>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="modal">
      <div class="modal-content">
        <h3>Edit User's Seat Number</h3>
        <form @submit.prevent="editUserSeat">
          <div class="form-group">
            <label>Seat Number</label>
            <input v-model="newSeatNumber" type="text" placeholder="e.g., B2" required />
          </div>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? "Updating..." : "Update Seat" }}
          </button>
          <button @click="closeEditUserModal" type="button" class="btn btn-secondary">
            Cancel
          </button>
        </form>
        <p v-if="editUserMessage" :class="{ success: isEditUserSuccess, error: !isEditUserSuccess }">
          {{ editUserMessage }}
        </p>
      </div>
    </div>

    <!-- Edit Hall Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>Edit Exam Hall</h3>
        <form @submit.prevent="updateExamHall">
          <div class="form-group">
            <label>Hall Name</label>
            <input v-model="editExamHole.holeName" type="text" required />
          </div>
          <div class="form-group">
            <label>Number</label>
            <input v-model.number="editExamHole.number" type="number" required />
          </div>
          <div class="form-group">
            <label>Capacity</label>
            <input v-model.number="editExamHole.capacity" type="number" required />
          </div>
          <div class="form-group">
            <label>Rows</label>
            <input v-model.number="editExamHole.row" type="number" required />
          </div>
          <div class="form-group">
            <label>Columns</label>
            <input v-model.number="editExamHole.col" type="number" required />
          </div>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? "Updating..." : "Update Exam Hall" }}
          </button>
          <button @click="closeEditModal" type="button" class="btn btn-secondary">
            Cancel
          </button>
        </form>
        <p v-if="editMessage" :class="{ success: isEditSuccess, error: !isEditSuccess }">
          {{ editMessage }}
        </p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal">
      <div class="modal-content">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this exam hall?</p>
        <button @click="deleteHall" class="btn btn-danger" :disabled="isLoading">
          {{ isLoading ? "Deleting..." : "Yes, Delete" }}
        </button>
        <button @click="closeDeleteConfirm" class="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>

    <!-- Add All Users Confirmation Modal -->
    <div v-if="showAddAllConfirm" class="modal">
      <div class="modal-content">
        <h3>Confirm Add All Users</h3>
        <p>Are you sure you want to add all available users to this hall?</p>
        <button @click="confirmAddAllUsers" class="btn btn-danger" :disabled="isLoading">
          {{ isLoading ? "Adding..." : "Yes, Add All" }}
        </button>
        <button @click="closeAddAllConfirm" class="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: "ExamHallManagement",
  data() {
    return {
      // Import Excel Modal Data
      fileUpload: null,
      importMessage: '',
      isImportSuccess: false,
      showImportModal: false,

      // Base URL for API
      baseUrl: "http://localhost:8081/api/v1",

      // Exam Halls Data
      examHoles: [],

      // Users in Selected Hall
      usersInHall: [],

      // Available Users to Assign
      availableUsers: [],

      // Modals Visibility
      showUsersModal: false,
      showEditUserModal: false,
      showEditModal: false,
      showDeleteConfirm: false,
      showAddAllConfirm: false,

      // Current Exam Hall Info
      currentHallId: null,
      currentHallName: "",

      // Admin Check (Replace with actual logic)
      isAdmin: true,

      // New Exam Hall Form Data
      newExamHole: {
        holeName: "",
        number: null,
        capacity: null,
        row: null,
        col: null,
      },

      // Edit Exam Hall Form Data
      editExamHole: {
        id: null,
        holeName: "",
        number: null,
        capacity: null,
        row: null,
        col: null,
      },

      // Assign User to Hall Data
      selectedUserId: "",
      selectedSeatNumber: "",

      // Edit User Seat Data
      editUser: null,
      newSeatNumber: "",

      // Messages and Statuses
      examHoleMessage: "",
      isExamHoleSuccess: false,
      userActionMessage: "",
      isUserActionSuccess: false,
      editMessage: "",
      isEditSuccess: false,
      editUserMessage: "",
      isEditUserSuccess: false,
      importMessage: '',
      isImportSuccess: false,

      // Deletion Data
      deleteHallId: null,

      // Loading State
      isLoading: false,
    };
  },
  computed: {
    // Compute available seats based on hall capacity and current assignments
    availableSeats() {
      const hall = this.examHoles.find((h) => h.id === this.currentHallId);
      if (hall) {
        const occupiedSeats = this.usersInHall.map((user) => user.seatNumber);
        const totalSeats = hall.capacity;
        const available = [];
        for (let i = 1; i <= totalSeats; i++) {
          if (!occupiedSeats.includes(String(i))) {
            available.push(String(i));
          }
        }
        return available;
      }
      return [];
    },
    // Compute available seats for editing (including the user's current seat)
    availableSeatsForEdit() {
      if (!this.editUser) return [];
      const hall = this.examHoles.find((h) => h.id === this.currentHallId);
      if (hall) {
        const occupiedSeats = this.usersInHall
          .filter((user) => user.userId !== this.editUser.userId)
          .map((user) => user.seatNumber);
        // Include the user's current seat as it's being edited
        const available = [];
        for (let i = 1; i <= hall.capacity; i++) {
          if (!occupiedSeats.includes(String(i))) {
            available.push(String(i));
          }
        }
        // Also include the current seat
        if (!occupiedSeats.includes(this.editUser.seatNumber)) {
          available.push(this.editUser.seatNumber);
        }
        return available.sort((a, b) => Number(a) - Number(b));
      }
      return [];
    },
  },
  created() {
    this.loadAllExamHoles();
  },
  methods: {
    // Load all exam halls
    async loadAllExamHoles() {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${this.baseUrl}/examhole/getAllExamHoles`
        );
        this.examHoles = response.data;
        this.examHoleMessage = "";
      } catch (error) {
        console.error("Error loading exam halls:", error);
        this.examHoleMessage = "Failed to load exam halls.";
        this.isExamHoleSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },

    // Load available exam halls (with available slots)
    async loadAvailableExamHoles() {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${this.baseUrl}/examhole/getAvailableExamHoles`
        );
        this.examHoles = response.data;
        this.examHoleMessage = "";
      } catch (error) {
        console.error("Error loading available exam halls:", error);
        this.examHoleMessage = "Failed to load available exam halls.";
        this.isExamHoleSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },

    // Add a new exam hall
    async addExamHole() {
      this.isLoading = true;
      try {
        const response = await axios.post(
          `${this.baseUrl}/examhole/addExamHole`,
          this.newExamHole
        );
        this.examHoleMessage = "Exam hall added successfully!";
        this.isExamHoleSuccess = true;
        await this.loadAllExamHoles();
        // Reset form
        this.newExamHole = {
          holeName: "",
          number: null,
          capacity: null,
          row: null,
          col: null,
        };
      } catch (error) {
        console.error("Error adding exam hall:", error);
        this.examHoleMessage = "Failed to add exam hall.";
        this.isExamHoleSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },

    // Confirm deletion of a hall
    confirmDeleteHall(id) {
      this.deleteHallId = id;
      this.showDeleteConfirm = true;
    },

    // Delete an exam hall
    async deleteHall() {
      if (!this.deleteHallId) return;
      this.isLoading = true;
      try {
        await axios.delete(
          `${this.baseUrl}/examhole/deleteExamHole/${this.deleteHallId}`
        );
        this.examHoleMessage = "Exam hall deleted successfully!";
        this.isExamHoleSuccess = true;
        await this.loadAllExamHoles();
      } catch (error) {
        console.error("Error deleting exam hall:", error);
        this.examHoleMessage = "Failed to delete exam hall.";
        this.isExamHoleSuccess = false;
      } finally {
        this.isLoading = false;
        this.showDeleteConfirm = false;
        this.deleteHallId = null;
      }
    },

    // Close delete confirmation modal
    closeDeleteConfirm() {
      this.showDeleteConfirm = false;
      this.deleteHallId = null;
    },

    // View users in a hall
    async viewUsers(hallId) {
      this.isLoading = true;
      try {
        const hall = this.examHoles.find((h) => h.id === hallId);
        if (!hall) throw new Error("Hall not found.");
        this.currentHallId = hallId;
        this.currentHallName = hall.holeName;
        const response = await axios.get(
          `${this.baseUrl}/examhole/getUsersInExamHole/${hallId}/users`
        );
        this.usersInHall = response.data; // Should contain userId, fname, lname, email, seatNumber
        this.showUsersModal = true;
        // Load available users to add (excluding those already in the hall)
        const allUsersResponse = await axios.get(
          `${this.baseUrl}/user/getAllUsers`
        );
        const usersInHallIds = this.usersInHall.map((user) => user.userId);
        this.availableUsers = allUsersResponse.data.filter(
          (user) => !usersInHallIds.includes(user.id)
        );
        this.userActionMessage = "";
        this.isUserActionSuccess = false;
        this.selectedUserId = "";
        this.selectedSeatNumber = ""; // Reset seat number input
      } catch (error) {
        console.error("Error loading users:", error);
        this.userActionMessage = "Failed to load users.";
        this.isUserActionSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },

    // Close users modal
    closeUsersModal() {
      this.showUsersModal = false;
      this.usersInHall = [];
      this.availableUsers = [];
      this.selectedUserId = "";
      this.selectedSeatNumber = "";
      this.userActionMessage = "";
      this.isUserActionSuccess = false;
      this.currentHallId = null;
      this.currentHallName = "";
    },


    // Remove user from hall
    async removeUserFromHall(hallId, userId) {
      if (!confirm("Are you sure you want to remove this user from the hall?")) {
        return; // Exit if user cancels
      }
      this.isLoading = true;
      try {
        const response = await axios.delete(
          `${this.baseUrl}/examhole/removeUserFromExamHole/${hallId}/users/${userId}`
        );
        this.userActionMessage = "User removed from hall successfully.";
        this.isUserActionSuccess = true;
        // Refresh users list
        await this.viewUsers(hallId);
      } catch (error) {
        console.error("Error removing user from hall:", error);
        if (error.response && error.response.data) {
          this.userActionMessage = error.response.data;
        } else {
          this.userActionMessage = "Failed to remove user from hall.";
        }
        this.isUserActionSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },

    // Open edit modal for a specific user
    openEditUserModal(user) {
      this.editUser = { ...user }; // Clone the user object
      this.newSeatNumber = ""; // Reset the new seat number
      this.showEditUserModal = true;
      this.editUserMessage = "";
      this.isEditUserSuccess = false;
    },

    // Close edit user modal
    closeEditUserModal() {
      this.showEditUserModal = false;
      this.editUser = null;
      this.newSeatNumber = "";
      this.editUserMessage = "";
      this.isEditUserSuccess = false;
    },

    // Edit user's seat number
    async editUserSeat() {
      if (!this.newSeatNumber) {
        this.editUserMessage = "Please enter a new seat number.";
        this.isEditUserSuccess = false;
        return;
      }
      this.isLoading = true;
      try {
        const response = await axios.put(
          `${this.baseUrl}/examhole/editUserSeatInExamHole/${this.currentHallId}/users/${this.editUser.userId}`,
          {
            seatNumber: this.newSeatNumber,
          }
        );
        this.editUserMessage = "User's seat number updated successfully.";
        this.isEditUserSuccess = true;
        // Refresh users list
        await this.viewUsers(this.currentHallId);
        // Close the modal after a short delay
        setTimeout(() => {
          this.closeEditUserModal();
        }, 1500);
      } catch (error) {
        console.error("Error editing user seat:", error);
        if (error.response && error.response.data) {
          this.editUserMessage = error.response.data;
        } else {
          this.editUserMessage = "Failed to update user's seat number.";
        }
        this.isEditUserSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },

    // Open edit modal with hall details
    openEditModal(hall) {
      this.editExamHole = { ...hall };
      this.showEditModal = true;
      this.editMessage = "";
      this.isEditSuccess = false;
    },

    // Close edit modal
    closeEditModal() {
      this.showEditModal = false;
      this.editExamHole = {
        id: null,
        holeName: "",
        number: null,
        capacity: null,
        row: null,
        col: null,
      };
      this.editMessage = "";
      this.isEditSuccess = false;
    },

    // Update exam hall details
    async updateExamHall() {
      this.isLoading = true;
      try {
        await axios.put(
          `${this.baseUrl}/examhole/updateExamHole/${this.editExamHole.id}`,
          this.editExamHole
        );
        this.editMessage = "Exam hall updated successfully!";
        this.isEditSuccess = true;
        await this.loadAllExamHoles();
        // Close the modal after a short delay
        setTimeout(() => {
          this.closeEditModal();
        }, 1500);
      } catch (error) {
        console.error("Error updating exam hall:", error);
        this.editMessage = "Failed to update exam hall.";
        this.isEditSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },

    // Assign single user to hall
    async assignUserToHall() {
      if (!this.selectedUserId || !this.selectedSeatNumber) {
        this.userActionMessage = "Please select a user and enter a seat number.";
        this.isUserActionSuccess = false;
        return;
      }

      // Validate seat number format (e.g., "A1", "B2")
      const seatPattern = /^[A-Z]\d+$/;
      if (!seatPattern.test(this.selectedSeatNumber)) {
        this.userActionMessage = "Invalid seat number format. Use format like 'A1', 'B2'.";
        this.isUserActionSuccess = false;
        return;
      }

      this.isLoading = true;
      try {
        // Construct the URL with path variables
        const url = `${this.baseUrl}/examhole/addUserToExamHole/${this.currentHallId}/users/${this.selectedUserId}`;

        // Make the POST request with seatNumber in the body
        await axios.post(url, {
          seatNumber: this.selectedSeatNumber,
        });

        this.userActionMessage = `User assigned successfully to seat ${this.selectedSeatNumber}.`;
        this.isUserActionSuccess = true;

        // Refresh users list
        await this.viewUsers(this.currentHallId);

        // Reset assignment form
        this.selectedUserId = "";
        this.selectedSeatNumber = "";
      } catch (error) {
        console.error("Error assigning user to hall:", error);
        if (error.response && error.response.data) {
          this.userActionMessage = error.response.data;
        } else {
          this.userActionMessage = "Failed to assign user to hall.";
        }
        this.isUserActionSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },


    // Open Add All Users Confirmation Modal
    addAllUsersToHall(hallId) {
      this.currentHallId = hallId;
      const hall = this.examHoles.find((h) => h.id === hallId);
      this.currentHallName = hall ? hall.holeName : "";
      this.showAddAllConfirm = true;
    },

    // Confirm adding all users
    async confirmAddAllUsers() {
      this.isLoading = true;
      try {
        const response = await axios.post(
          `${this.baseUrl}/examhole/assignAllUsersToExamHole`,
          {
            examHoleId: this.currentHallId,
          }
        );
        this.userActionMessage = "All available users have been assigned to the hall successfully.";
        this.isUserActionSuccess = true;
        // Refresh users list
        await this.viewUsers(this.currentHallId);
      } catch (error) {
        console.error("Error adding all users to hall:", error);
        if (error.response && error.response.data) {
          this.userActionMessage = error.response.data;
        } else {
          this.userActionMessage = "Failed to add all users to hall.";
        }
        this.isUserActionSuccess = false;
      } finally {
        this.isLoading = false;
        this.showAddAllConfirm = false;
      }
    },

    // Close Add All Users Confirmation Modal
    closeAddAllConfirm() {
      this.showAddAllConfirm = false;
    },

    // Open Import Users Modal
    openImportModal(hallId) {
      this.currentHallId = hallId;
      const hall = this.examHoles.find(h => h.id === hallId);
      this.currentHallName = hall ? hall.holeName : '';
      this.showImportModal = true;
      this.importMessage = '';
      this.isImportSuccess = false;
      this.fileUpload = null;
    },

    // Handle File Selection for Import
    handleFileUpload(event) {
      this.fileUpload = event.target.files[0];
    },

    // Import and process Excel file
    async importExcelData() {
      if (!this.fileUpload) {
        this.importMessage = 'Please select a file to import.';
        this.isImportSuccess = false;
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!allowedTypes.includes(this.fileUpload.type)) {
        this.importMessage = 'Invalid file type. Please upload an Excel file.';
        this.isImportSuccess = false;
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (this.fileUpload.size > maxSize) {
        this.importMessage = 'File size exceeds the maximum limit of 5MB.';
        this.isImportSuccess = false;
        return;
      }

      // Proceed with upload
      this.isLoading = true;
      const formData = new FormData();
      formData.append('file', this.fileUpload);

      try {
        const response = await axios.post(
          `${this.baseUrl}/examhole/importUsersFromExcel/${this.currentHallId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        this.importMessage = 'Users imported and assigned successfully!';
        this.isImportSuccess = true;

        // Refresh users list
        await this.viewUsers(this.currentHallId);

        // Close modal after short delay
        setTimeout(() => {
          this.closeImportModal();
        }, 1500);
      } catch (error) {
        console.error('Error importing users:', error);
        // Display detailed error message from backend if available
        if (error.response && error.response.data) {
          this.importMessage = error.response.data;
        } else {
          this.importMessage = 'Failed to import users.';
        }
        this.isImportSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },


    // Close Import Users Modal
    closeImportModal() {
      this.showImportModal = false;
      this.fileUpload = null;
      this.importMessage = '';
      this.isImportSuccess = false;
    }
  },
};
</script>




<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #444;
}

.admin-section {
  margin-bottom: 30px;
}

.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-link {
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  margin-right: 10px;
  text-decoration: underline;
}

.btn-link.delete {
  color: #e74c3c;
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #666;
}

.actions {
  display: flex;
  align-items: center;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 60%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.users-table {
  margin: 15px 0;
}

.add-user-section {
  margin-top: 20px;
}

.success {
  color: green;
  margin-top: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 90%;
  }

  .table-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
