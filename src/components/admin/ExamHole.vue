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
              <!-- Updated Assign Seats button to open modal -->
              <button v-if="isAdmin" @click="openAssignSeatsModal(hall.id)" class="btn-link assign">
                Assign Seats
              </button>
              <button v-if="isAdmin" @click="confirmDeleteHall(hall.id)" class="btn-link delete">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Users Modal -->
    <div v-if="showUsersModal" class="modal">
      <div class="modal-content">
        <h3>Users in Hall: {{ currentHallName }}</h3>
        <div class="modal-header-actions">
          <button @click="printExamHallUsers(currentHallId)" class="btn btn-print">
            <i class="fas fa-print"></i> Print Hall Information
          </button>
        </div>
        <!-- Add User Form -->
        <div v-if="isAdmin" class="add-user-section">
          <h4>Add User to Hall</h4>
          <form @submit.prevent="assignUserToHall">
            <div class="form-group">
              <label>Select User</label>
              <select 
                v-model="selectedUserId" 
                @change="onUserSelectionChange" 
                required
              >
                <option disabled value="">Please select a user</option>
                <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                  {{ user.fname }} {{ user.lname }} ({{ user.email }}) 
                  <span v-if="user.role">[{{ user.role }}]</span>
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Seat Number</label>
              <input 
                v-if="!isTeacherSelected" 
                v-model="selectedSeatNumber" 
                type="text" 
                placeholder="e.g., A1" 
                required 
              />
              <input 
                v-else 
                v-model="selectedSeatNumber" 
                type="text" 
                readonly 
                class="teacher-seat-input"
              />
              <small v-if="isTeacherSelected" class="teacher-note">
                Teachers are automatically assigned to "Teacher Stage"
              </small>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              Assign User
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
                <th>Role</th>
                <th>Seat</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usersInHall" :key="user.userId">
                <td>{{ user.fname }} {{ user.lname }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role || 'STUDENT' }}</td>
                <td>
                  <span 
                    v-if="user.seatNumber === 'Teacher Stage'" 
                    class="teacher-stage"
                  >
                    Teacher Stage
                  </span>
                  <span v-else>
                    {{ user.seatNumber }}
                  </span>
                </td>
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

    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="modal">
      <div class="modal-content">
        <h3>Edit User's Seat Assignment</h3>
        <form @submit.prevent="editUserSeat">
          <div class="form-group">
            <label>User</label>
            <p><strong>{{ editUser.fname }} {{ editUser.lname }}</strong> <span v-if="editUser.role">({{ editUser.role }})</span></p>
          </div>
          <div class="form-group" v-if="editUser && editUser.role === 'TEACHER'">
            <label>Seat Assignment</label>
            <input 
              v-model="newSeatNumber" 
              type="text" 
              value="Teacher Stage" 
              readonly 
              class="teacher-seat-input" 
            />
            <small class="teacher-note">Teachers are assigned to "Teacher Stage"</small>
          </div>
          <div class="form-group" v-else>
            <label>Seat Number</label>
            <input 
              v-model="newSeatNumber" 
              type="text" 
              placeholder="e.g., B2" 
              required 
            />
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

    <!-- Assign Seats Modal -->
    <div v-if="showAssignSeatsModal" class="modal">
      <div class="modal-content">
        <h3>Assign Seats - {{ currentHallName }}</h3>
        <div class="assign-seats-container">
          <div class="department-selection">
            <h4>Select Departments</h4>
            <div class="departments-grid">
              <!-- Level 1 Departments -->
              <div class="level-section">
                <h5>Level 1</h5>
                <div v-for="dept in departmentsByLevel[1]" :key="dept.id" class="dept-checkbox">
                  <input 
                    type="checkbox" 
                    :id="'dept-' + dept.id" 
                    :value="dept.name" 
                    v-model="selectedDepartments"
                  />
                  <label :for="'dept-' + dept.id">{{ dept.name }}</label>
                </div>
              </div>
              
              <!-- Level 2 Departments -->
              <div class="level-section">
                <h5>Level 2</h5>
                <div v-for="dept in departmentsByLevel[2]" :key="dept.id" class="dept-checkbox">
                  <input 
                    type="checkbox" 
                    :id="'dept-' + dept.id" 
                    :value="dept.name" 
                    v-model="selectedDepartments"
                  />
                  <label :for="'dept-' + dept.id">{{ dept.name }}</label>
                </div>
              </div>
              
              <!-- Level 3 Departments -->
              <div class="level-section">
                <h5>Level 3</h5>
                <div v-for="dept in departmentsByLevel[3]" :key="dept.id" class="dept-checkbox">
                  <input 
                    type="checkbox" 
                    :id="'dept-' + dept.id" 
                    :value="dept.name" 
                    v-model="selectedDepartments"
                  />
                  <label :for="'dept-' + dept.id">{{ dept.name }}</label>
                </div>
              </div>
              
              <!-- Level 4 Departments -->
              <div class="level-section">
                <h5>Level 4</h5>
                <div v-for="dept in departmentsByLevel[4]" :key="dept.id" class="dept-checkbox">
                  <input 
                    type="checkbox" 
                    :id="'dept-' + dept.id" 
                    :value="dept.name" 
                    v-model="selectedDepartments"
                  />
                  <label :for="'dept-' + dept.id">{{ dept.name }}</label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Level Grouping Configuration -->
          <div class="level-grouping">
            <h4>Level Grouping</h4>
            <div class="grouping-config">
              <div>
                <h5>Group 1 (A, D, I, L columns)</h5>
                <div class="group-selection">
                  <div v-for="level in [1, 2, 3, 4]" :key="`level1-${level}`" class="level-checkbox">
                    <input 
                      type="checkbox" 
                      :id="`group1-level-${level}`" 
                      :value="level" 
                      v-model="firstLevelGroup"
                    />
                    <label :for="`group1-level-${level}`">Level {{ level }}</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h5>Group 2 (C, G, J columns)</h5>
                <div class="group-selection">
                  <div v-for="level in [1, 2, 3, 4]" :key="`level2-${level}`" class="level-checkbox">
                    <input 
                      type="checkbox" 
                      :id="`group2-level-${level}`" 
                      :value="level" 
                      v-model="secondLevelGroup"
                    />
                    <label :for="`group2-level-${level}`">Level {{ level }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="selected-departments-summary">
          <h4>Selection Summary</h4>
          <p><strong>Selected Departments:</strong> {{ selectedDepartments.length }}</p>
          <p><strong>Group 1 (A, D, I, L):</strong> {{ firstLevelGroup.join(', ') || 'None' }} </p>
          <p><strong>Group 2 (C, G, J):</strong> {{ secondLevelGroup.join(', ') || 'None' }} </p>
        </div>
        
        <div class="assign-seats-actions">
          <button @click="assignSeatsToHall" class="btn btn-primary" :disabled="isLoading || selectedDepartments.length === 0 || firstLevelGroup.length === 0 || secondLevelGroup.length === 0">
            {{ isLoading ? "Assigning..." : "Assign Seats" }}
          </button>
          <button @click="closeAssignSeatsModal" class="btn btn-secondary">
            Cancel
          </button>
        </div>
        
        <p v-if="assignMessage" :class="{ success: isAssignSuccess, error: !isAssignSuccess }">
          {{ assignMessage }}
        </p>
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

    <!-- Notification div to replace toast -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      {{ notificationMessage }}
      <span class="close-notification" @click="closeNotification">&times;</span>
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
      currentAssigningHall: null,
      
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
      showAssignSeatsModal: false,
      
      // Custom notification instead of toast
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      notificationTimeout: null,

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
      
      // Teacher detection properties
      selectedUserRole: null,
      isTeacherSelected: false,

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
      assignMessage: "",
      isAssignSuccess: false,

      // Deletion Data
      deleteHallId: null,

      // Loading State
      isLoading: false,
      
      // Department data for seat assignment
      departments: [],
      departmentsByLevel: {
        1: [],
        2: [],
        3: [],
        4: []
      },
      selectedDepartments: [],
      firstLevelGroup: [1, 3], // Default: Levels 1 & 3 together
      secondLevelGroup: [2, 4], // Default: Levels 2 & 4 together
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
    this.loadAllDepartments();
  },
  methods: {
    // Custom notification method to replace toast
    showToast(message, type = 'success', duration = 3000) {
      // Clear any existing notification timeout
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      
      // Set notification properties
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      
      // Auto-hide after duration
      this.notificationTimeout = setTimeout(() => {
        this.closeNotification();
      }, duration);
    },
    
    closeNotification() {
      this.showNotification = false;
    },
    
    // Method to handle user selection change
    onUserSelectionChange() {
      if (!this.selectedUserId) {
        this.isTeacherSelected = false;
        this.selectedUserRole = null;
        return;
      }
      
      // Find the selected user
      const selectedUser = this.availableUsers.find(user => user.id === this.selectedUserId);
      
      if (selectedUser) {
        this.selectedUserRole = selectedUser.role;
        // Check if the selected user is a teacher
        this.isTeacherSelected = selectedUser.role === 'TEACHER';
        
        // If teacher is selected, automatically set seat to "Teacher Stage"
        if (this.isTeacherSelected) {
          this.selectedSeatNumber = "Teacher Stage";
        } else {
          // Reset seat number if it was previously set to Teacher Stage
          if (this.selectedSeatNumber === "Teacher Stage") {
            this.selectedSeatNumber = "";
          }
        }
      }
    },
    
    // Load all departments for seat assignment
    async loadAllDepartments() {
      try {
        const response = await axios.get(`${this.baseUrl}/department/getAllDepartments`);
        this.departments = response.data;
        
        // Reset department levels
        this.departmentsByLevel = {
          1: [],
          2: [],
          3: [],
          4: []
        };
        
        // Group departments by level
        this.departments.forEach(dept => {
          const level = this.extractLevelFromDepartment(dept.name);
          if (level >= 1 && level <= 4) {
            this.departmentsByLevel[level].push(dept);
          }
        });
      } catch (error) {
        console.error("Error loading departments:", error);
        this.showToast("Failed to load departments", "error");
      }
    },
    
    // Helper to extract level from department name
    extractLevelFromDepartment(name) {
      const match = name.match(/\b(\d+)\b/);
      return match ? parseInt(match[1]) : 0;
    },
    
    // Open the assign seats modal
    openAssignSeatsModal(hallId) {
      this.currentHallId = hallId;
      const hall = this.examHoles.find(h => h.id === hallId);
      if (hall) {
        this.currentHallName = hall.holeName;
      }
      
      // Reset selection state
      this.selectedDepartments = [];
      this.firstLevelGroup = [1, 3]; // Default to levels 1 & 3
      this.secondLevelGroup = [2, 4]; // Default to levels 2 & 4
      this.assignMessage = "";
      this.isAssignSuccess = false;
      
      this.showAssignSeatsModal = true;
    },
    
    // Close the assign seats modal
    closeAssignSeatsModal() {
      this.showAssignSeatsModal = false;
      this.selectedDepartments = [];
      this.assignMessage = "";
    },
    
    // Method to assign seats to hall using the new dynamic functionality
    async assignSeatsToHall() {
      if (this.selectedDepartments.length === 0) {
        this.assignMessage = "Please select at least one department.";
        this.isAssignSuccess = false;
        return;
      }
      
      if (this.firstLevelGroup.length === 0 || this.secondLevelGroup.length === 0) {
        this.assignMessage = "Please select at least one level for each group.";
        this.isAssignSuccess = false;
        return;
      }
      
      // Check for overlapping levels between groups
      const overlappingLevels = this.firstLevelGroup.filter(level => 
        this.secondLevelGroup.includes(level)
      );
      
      if (overlappingLevels.length > 0) {
        this.assignMessage = `Levels ${overlappingLevels.join(', ')} cannot be in both groups.`;
        this.isAssignSuccess = false;
        return;
      }
      
      this.isLoading = true;
      
      try {
        // Make API call to assign seats with selected departments and level groups
        const response = await axios.post(
          `${this.baseUrl}/examhole-assignment/assign-seats-custom/${this.currentHallId}`,
          {
            departments: this.selectedDepartments,
            firstLevelGroup: this.firstLevelGroup,
            secondLevelGroup: this.secondLevelGroup
          }
        );
        
        this.assignMessage = "Seats assigned successfully!";
        this.isAssignSuccess = true;
        
        // Show success notification
        this.showToast('Users assigned to seats successfully!', 'success');
        
        // Refresh the exam halls list
        await this.loadAllExamHoles();
        
        // Close modal after a short delay
        setTimeout(() => {
          this.closeAssignSeatsModal();
        }, 1500);
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to assign seats';
        
        this.assignMessage = errorMessage;
        this.isAssignSuccess = false;
        
        this.showToast(errorMessage, 'error', 5000);
        
      } finally {
        this.isLoading = false;
      }
    },

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
        this.showToast("Failed to load exam halls", "error");
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
        this.showToast("Failed to load available exam halls", "error");
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
        this.showToast("Exam hall added successfully!", "success");
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
        this.showToast("Failed to add exam hall", "error");
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
        this.showToast("Exam hall deleted successfully!", "success");
        await this.loadAllExamHoles();
      } catch (error) {
        console.error("Error deleting exam hall:", error);
        this.examHoleMessage = "Failed to delete exam hall.";
        this.isExamHoleSuccess = false;
        this.showToast("Failed to delete exam hall", "error");
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
        
        // Get users in the exam hall
        const response = await axios.get(
          `${this.baseUrl}/examhole/getUsersInExamHole/${hallId}/users`
        );
        this.usersInHall = response.data; // Should contain userId, fname, lname, email, seatNumber, role
        
        // Count teachers already assigned to "Teacher Stage"
        const teachersAssigned = this.usersInHall.filter(
          user => user.role === 'TEACHER' && user.seatNumber === 'Teacher Stage'
        ).length;
        
        this.showUsersModal = true;
        
        // Load available users to add (excluding those already in the hall)
        const allUsersResponse = await axios.get(
          `${this.baseUrl}/user/getAllUsers`
        );
        
        const usersInHallIds = this.usersInHall.map((user) => user.userId);
        
        // Filter available users
        // If we already have 2 teachers assigned, don't show more teachers as available
        let availableUsers = allUsersResponse.data.filter(
          (user) => !usersInHallIds.includes(user.id)
        );
        
        if (teachersAssigned >= 2) {
          availableUsers = availableUsers.filter(user => user.role !== 'TEACHER');
        }
        
        this.availableUsers = availableUsers;
        
        this.userActionMessage = "";
        this.isUserActionSuccess = false;
        this.selectedUserId = "";
        this.selectedSeatNumber = "";
        this.isTeacherSelected = false;
        this.selectedUserRole = null;
      } catch (error) {
        console.error("Error loading users:", error);
        this.userActionMessage = "Failed to load users.";
        this.isUserActionSuccess = false;
        this.showToast("Failed to load users", "error");
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
      this.isTeacherSelected = false;
      this.selectedUserRole = null;
    },

    // Print exam hall with users
    printExamHallUsers(hallId) {
      this.isLoading = true;

      // Find hall data
      const hall = this.examHoles.find((h) => h.id === hallId);
      if (!hall) {
        console.error("Hall not found");
        this.isLoading = false;
        return;
      }

      // Fetch users in this hall
      axios.get(`${this.baseUrl}/examhole/getUsersInExamHole/${hallId}/users`)
        .then(response => {
          const usersData = response.data;

          // Create print window
          const printWindow = window.open('', '_blank');

          // Prepare content for printing
          const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Exam Hall - ${hall.holeName}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
                h1 {
                  text-align: center;
                  margin-bottom: 5px;
                }
                h2 {
                  text-align: center;
                  margin-top: 0;
                  margin-bottom: 20px;
                  font-size: 16px;
                  font-weight: normal;
                }
                .hall-info {
                  border: 1px solid #333;
                  padding: 15px;
                  margin-bottom: 20px;
                  background-color: #f9f9f9;
                }
                .hall-info p {
                  margin: 5px 0;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  border: 1px solid #333;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f2f2f2;
                }
                .teacher-stage {
                  background-color: #e2f0d9;
                  font-weight: bold;
                  padding: 3px 8px;
                  border-radius: 4px;
                }
                .footer {
                  margin-top: 30px;
                  text-align: center;
                  font-size: 12px;
                }
                @media print {
                  .no-print {
                    display: none;
                  }
                  @page {
                    margin: 1.5cm;
                  }
                }
              </style>
            </head>
            <body>
              <h1>Exam Hall: ${hall.holeName}</h1>
              <h2>Seating Arrangement</h2>
              
              <div class="hall-info">
                <p><strong>Hall Number:</strong> ${hall.number}</p>
                <p><strong>Capacity:</strong> ${hall.capacity} seats</p>
                <p><strong>Layout:</strong> ${hall.row} rows × ${hall.col} columns</p>
                <p><strong>Date Printed:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <h3>Assigned Users</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Seat</th>
                  </tr>
                </thead>
                <tbody>
                  ${usersData.map(user => `
                    <tr>
                      <td>${user.fname} ${user.lname}</td>
                      <td>${user.email}</td>
                      <td>${user.role || 'STUDENT'}</td>
                      <td>${user.seatNumber === 'Teacher Stage' 
                          ? '<span class="teacher-stage">Teacher Stage</span>' 
                          : user.seatNumber}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="footer">
                <p>Total Users: ${usersData.length} / ${hall.capacity}</p>
                <p>Available Seats: ${hall.capacity - usersData.length}</p>
              </div>
              
              <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button onclick="window.print();" style="padding: 10px 20px; cursor: pointer;">Print this page</button>
                <button onclick="window.close();" style="padding: 10px 20px; margin-left: 10px; cursor: pointer;">Close</button>
              </div>
            </body>
            </html>
          `;

          // Write to the new window and trigger print
          printWindow.document.open();
          printWindow.document.write(printContent);
          printWindow.document.close();

          // Remove loading state when window is fully loaded
          printWindow.onload = () => {
            this.isLoading = false;
          };

        })
        .catch(error => {
          console.error("Error fetching users for printing:", error);
          this.isLoading = false;
          this.showToast("Error fetching users for printing", "error");
        });
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
        this.showToast("User removed successfully", "success");
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
        this.showToast("Failed to remove user", "error");
      } finally {
        this.isLoading = false;
      }
    },

    // Open edit modal for a specific user
    openEditUserModal(user) {
      this.editUser = { ...user }; // Clone the user object
      
      // Set default seat number based on role
      if (user.role === 'TEACHER') {
        this.newSeatNumber = "Teacher Stage";
      } else {
        this.newSeatNumber = user.seatNumber || "";
      }
      
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
      
      // For teachers, we allow "Teacher Stage" as a valid seat
      const isTeacherStage = this.newSeatNumber === "Teacher Stage";
      
      // Only validate seat format for non-teacher seats
      if (!isTeacherStage) {
        // Validate seat number format (e.g., "A1", "B2")
        const seatPattern = /^[A-Z]\d+$/;
        if (!seatPattern.test(this.newSeatNumber)) {
          this.editUserMessage = "Invalid seat number format. Use format like 'A1', 'B2'.";
          this.isEditUserSuccess = false;
          return;
        }
      }
      
      this.isLoading = true;
      try {
        const response = await axios.put(
          `${this.baseUrl}/examhole/editUserSeatInExamHole/${this.currentHallId}/users/${this.editUser.userId}`,
          {
            seatNumber: this.newSeatNumber,
          }
        );
        this.editUserMessage = "User's seat assignment updated successfully.";
        this.isEditUserSuccess = true;
        this.showToast("Seat assignment updated successfully", "success");
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
          this.editUserMessage = "Failed to update user's seat assignment.";
        }
        this.isEditUserSuccess = false;
        this.showToast("Failed to update seat assignment", "error");
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
        this.showToast("Exam hall updated successfully", "success");
        await this.loadAllExamHoles();
        // Close the modal after a short delay
        setTimeout(() => {
          this.closeEditModal();
        }, 1500);
      } catch (error) {
        console.error("Error updating exam hall:", error);
        this.editMessage = "Failed to update exam hall.";
        this.isEditSuccess = false;
        this.showToast("Failed to update exam hall", "error");
      } finally {
        this.isLoading = false;
      }
    },

    // Assign single user to hall
    async assignUserToHall() {
      if (!this.selectedUserId) {
        this.userActionMessage = "Please select a user.";
        this.isUserActionSuccess = false;
        return;
      }
      
      if (!this.selectedSeatNumber) {
        this.userActionMessage = "Please enter a seat number.";
        this.isUserActionSuccess = false;
        return;
      }

      // For teachers, we allow "Teacher Stage" as a valid seat
      const isTeacherStage = this.selectedSeatNumber === "Teacher Stage";
      
      // Only validate seat format for non-teacher seats
      if (!isTeacherStage) {
        // Validate seat number format (e.g., "A1", "B2")
        const seatPattern = /^[A-Z]\d+$/;
        if (!seatPattern.test(this.selectedSeatNumber)) {
          this.userActionMessage = "Invalid seat number format. Use format like 'A1', 'B2'.";
          this.isUserActionSuccess = false;
          return;
        }
      }

      this.isLoading = true;
      try {
        // Construct the URL with path variables
        const url = `${this.baseUrl}/examhole/addUserToExamHole/${this.currentHallId}/users/${this.selectedUserId}`;

        // Make the POST request with seatNumber in the body
        await axios.post(url, {
          seatNumber: this.selectedSeatNumber,
        });

        this.userActionMessage = `User assigned successfully to ${this.selectedSeatNumber}.`;
        this.isUserActionSuccess = true;
        this.showToast(`User assigned to ${this.selectedSeatNumber}`, "success");

        // Refresh users list
        await this.viewUsers(this.currentHallId);

        // Reset assignment form
        this.selectedUserId = "";
        this.selectedSeatNumber = "";
        this.isTeacherSelected = false;
        this.selectedUserRole = null;
      } catch (error) {
        console.error("Error assigning user to hall:", error);
        if (error.response && error.response.data) {
          this.userActionMessage = error.response.data;
        } else {
          this.userActionMessage = "Failed to assign user to hall.";
        }
        this.isUserActionSuccess = false;
        this.showToast("Failed to assign user", "error");
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
        this.showToast("All users assigned successfully", "success");
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
        this.showToast("Failed to assign all users", "error");
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
.btn-link.assign {
  color: #4CAF50;
  /* Green color for assignment */
  border-color: #4CAF50;
}

.btn-link.assign:hover {
  background-color: #e8f5e9;
}

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
