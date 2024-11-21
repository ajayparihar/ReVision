---

# **ReVision Documentation**

## **Access Link**  
[Click here to access the application](#) *https://ajayparihar.github.io/ReVision*

---

## **Project Summary**  
**ReVision** is a user-focused web application built to enhance learning and retention using the **spaced repetition technique**. It calculates and displays the topics or subjects you need to revise at optimal intervals—**immediately**, **1 day**, **15 days**, **1 week**, and **1 month** after studying—ensuring better long-term memory retention. The app simplifies the process of staying consistent with your revision goals.  

To use the tool, users need to maintain an **Excel or Google Sheet** where they update the topics studied each day, along with the date. Based on this data, the application highlights the topics due for revision on a given day, helping you stay organized and efficient in your study routine.

---

## **Technical Details**

### **1. Core Features**  
- **Memory-Based Revision Schedule**: Automatically calculates and displays topics for revision at optimal intervals (immediately, 1 day, 15 days, 1 week, and 1 month).  
- **Excel Integration**: Allows users to input and manage their study data via Excel or Google Sheets for daily tracking.  
- **Dynamic Search**: Enables users to quickly filter and locate topics.  
- **Responsive Design**: Provides seamless usability across devices with tailored layouts for different screen sizes.  
- **Interactive UI Elements**: Tooltips, date pickers, and hover effects enhance the user experience.  
- **Loading Animation**: Smooth feedback during data processing or transitions.  

---

### **2. Tech Stack & Libraries Used**  

#### **Frontend**  
- **HTML5**: For semantic structure and accessibility.  
- **CSS3**: Custom styles emphasizing responsiveness and interactivity.  
  - *Techniques*: CSS Variables, Shadows, Transitions, and Tooltips.  
- **JavaScript (ES6+)**: Implements dynamic functionalities like search and interactive behaviors.  
- **Flatpickr**: Lightweight library for intuitive and customizable date selection.  

#### **Design Elements**  
- **Typography**: Segoe UI for a clean, professional look.  
- **Theme**: Grey and yellow theme, optimized for readability and focus.  
- **Icons**: Integrated hover-responsive icons for enhanced interactivity.

---

### **3. Approach**  

#### **Spaced Repetition Logic**  
- Implements a structured schedule for memory optimization, aligning with educational research on retention intervals.  
- Excel sheet integration ensures flexibility, allowing users to track their study progress and schedule revisions effectively.

#### **User-Centric Theming**  
- **CSS Variables**: Enable theme customization for scalable color schemes and spacing.  
- **Componentized Styling**: Modular approach ensures easy updates and maintenance.  

#### **Responsiveness**  
- **Mobile-First Design**: Prioritizes small-screen usability while scaling up for larger devices.  
- **Media Queries**: Adjust layouts, font sizes, and visibility for different breakpoints.  

#### **Interactive Features**  
- **Dynamic Tooltips**: Provide contextual guidance without overwhelming the interface.  
- **Hover Effects**: Create an intuitive and engaging user experience with smooth transitions.  

---

### **4. Key Highlights**  
- **Accessibility**: Designed with clear contrasts, readable fonts, and easy navigation for users of all abilities.  
- **Performance Optimization**:  
  - Lightweight use of external libraries for optimal performance.  
  - Leverages native CSS features to reduce dependency on external animations.  

#### **Code Organization**  
- Clean, modular structure with reusable classes for enhanced maintainability.  
- Styles and scripts are organized to simplify future enhancements or debugging.  

---

### **5. Installation and Setup**  

1. **Clone the Repository**:  
   ```bash
   git clone https://github.com/your-repo.git
   ```  

2. **Navigate to the Project Directory**:  
   ```bash
   cd project-folder
   ```  

3. **Run the Application**:  
   Open the `index.html` file in a browser or use a development server like `Live Server`.

4. **Prepare Your Excel Sheet**:  
   - Create an Excel or Google Sheet with columns for topics and their study dates.  
   - Upload this sheet or integrate it with the app to track and plan revisions.  

---

### **6. Future Improvements**  
- **Advanced Scheduling Options**: Allow users to customize their revision intervals.  
- **Google Sheets API Integration**: Automatically fetch and update study data in real time.  
- **Enhanced Visual Analytics**: Graphical representations of progress and revision schedules.  
- **Multi-User Support**: Enable collaborative or shared revision tracking.  

--- 
