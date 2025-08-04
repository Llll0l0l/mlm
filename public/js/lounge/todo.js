const addTaskBtn = document.querySelector(".add-task-btn");
const taskUl = document.querySelector(".todo-list");
const taskInput = document.querySelector("#new-task");
const todoTitle = document.querySelector(".todo-title");
const shareLink = document.querySelector(".share-link");
const shareModal = document.querySelector(".share-modal");
const modalBackdrop = document.querySelector(".modal-backdrop");
let tasksInLocalstorage = JSON.parse(localStorage.getItem("tasks")) || [];
const todoListTitle = localStorage.getItem("todoListTitle") || "";

// add tasks if there already are
if (tasksInLocalstorage.length) {
  tasksInLocalstorage.forEach((taskLi) => {
    taskUl.insertAdjacentHTML("afterbegin", taskLi);
  });
}

if (todoListTitle) {
  todoTitle.textContent = todoListTitle;
}

const addTask = function (taskText) {
  const taskLi = `<li class="task"><input type="checkbox"/><span class="task-text">${taskText}</span><i class="fa-solid fa-xmark delete-task"></i><i class="fa-solid fa-pencil edit-task"></i></li>`;
  taskUl.insertAdjacentHTML("afterbegin", taskLi);
  tasksInLocalstorage.push(taskLi);
  localStorage.setItem("tasks", JSON.stringify(tasksInLocalstorage));
  taskInput.value = "";
};

addTaskBtn.addEventListener("click", (e) => {
  const newTask = taskInput.value;
  if (newTask) addTask(newTask);
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const newTask = taskInput.value;
    if (newTask) addTask(newTask);
  }
});

// delete and edit task
taskUl.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li || !taskUl.contains(li)) return;

  //   delete task
  if (e.target.classList.contains("delete-task")) {
    li.remove();
    tasksInLocalstorage = [
      ...tasksInLocalstorage.filter((task) => {
        const spanStart = task.indexOf('<span class="task-text">');
        const spanEnd = task.indexOf("</span>");
        if (spanStart === -1 || spanEnd === -1) return true;
        const taskText = task.slice(spanStart + 24, spanEnd).trim();
        const liText = li.querySelector("span")?.textContent?.trim();

        return taskText !== liText;
      }),
    ];
    localStorage.setItem("tasks", JSON.stringify(tasksInLocalstorage));
  }

  //   edit task
  if (e.target.classList.contains("edit-task")) {
    const span = li.querySelector(".task-text");
    const oldText = span.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldText;
    input.className = "task-edit-input";
    input.style.fontSize = "1.5rem";
    input.style.width = "200px";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.background = "none";
    span.replaceWith(input);
    input.focus();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const newText = input.value.trim();
        if (!newText) return; // don't allow empty task text

        span.textContent = newText;
        input.replaceWith(span);

        tasksInLocalstorage = tasksInLocalstorage.map((task) => {
          const spanStart = task.indexOf('<span class="task-text">');
          const spanEnd = task.indexOf("</span>");
          if (spanStart === -1 || spanEnd === -1) return task;
          const taskText = task.slice(spanStart + 24, spanEnd).trim();
          if (taskText === oldText) {
            // Replace old text with new text in the HTML string
            return (
              task.slice(0, spanStart + 24) + newText + task.slice(spanEnd)
            );
          }

          return task;
        });
        localStorage.setItem("tasks", JSON.stringify(tasksInLocalstorage));
      }
    });
  }
});

todoTitle.addEventListener("click", (e) => {
  const input = document.createElement("input");
  todoTitle.replaceWith(input);
  input.style.fontSize = "1.5rem";
  input.style.width = "200px";
  input.style.border = "none";
  input.style.outline = "none";
  input.style.background = "none";
  input.style.borderBottom = "1px black solid";
  input.placeholder = todoTitle.textContent;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      todoTitle.textContent = input.value;
      input.replaceWith(todoTitle);
      localStorage.setItem("todoListTitle", todoTitle.textContent);
    }
  });
});

shareLink.addEventListener("click", () => {
  shareModal.classList.remove("hidden");
  modalBackdrop.classList.remove("hidden");
  modalBackdrop.style.opacity = "0.5";
  shareModal.style.opacity = "1";
  shareModal.style.display = "flex";

  // add all the content to db via api
  const tasksToShare = localStorage.getItem("tasks");
  const titleToShare = localStorage.getItem("todoListTitle");
});

modalBackdrop.addEventListener("click", (e) => {
  if (e.target.closest(".share-modal")) return;
  shareModal.classList.add("hidden");
  modalBackdrop.classList.add("hidden");
  shareModal.style.display = "none";
});
