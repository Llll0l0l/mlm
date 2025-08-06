const addTaskBtn = document.querySelector(".add-task-btn");
const taskUl = document.querySelector(".todo-list");
const taskInput = document.querySelector("#new-task");
const todoTitle = document.querySelector(".todo-title");
const shareLink = document.querySelector(".share-link");
const shareModal = document.querySelector(".share-modal");
const modalBackdrop = document.querySelector(".modal-backdrop");
let tasksInLocalstorage = JSON.parse(localStorage.getItem("tasks")) || [];

const addTask = function (taskText) {
  const taskLi = `<li class="task"><div class="checkbox-task"><input type="checkbox" class="checkbox"/><span class="task-text">${taskText}</span></div><div class="edit-del-btns"><i class="fa-solid fa-xmark delete-task"></i><i class="fa-solid fa-pencil edit-task"></i></div></li>`;

  // add task to db
  try {
    if (taskUl.querySelector("li")?.classList.contains("no-tasks")) {
      taskUl.innerHTML = "";
    }
    taskUl.insertAdjacentHTML("afterbegin", taskLi);
    tasksInLocalstorage.push(taskLi);
    localStorage.setItem("tasks", JSON.stringify(tasksInLocalstorage));
    const url = "/api/update-task-list";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newTaskList: tasksInLocalstorage }),
    });
  } catch (err) {
    console.error(err);
  }

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
    // delete task from db
    try {
      li.remove();
      if (taskUl.innerHTML.trim() === "") {
        taskUl.insertAdjacentHTML(
          "afterbegin",
          `<li class="task no-tasks">No tasks yet.</li>`
        );
      }
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

      const url = "/api/update-task-list";
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTaskList: tasksInLocalstorage }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  //   edit task
  if (e.target.classList.contains("edit-task")) {
    if (!e.target.classList.contains("edit-task")) return;

    const li = e.target.closest("li");
    if (!li) return;

    const span = li.querySelector(".task-text");
    if (!span) return;

    const oldText = span.textContent;

    // Find index of the clicked li among all lis with the same task text
    const lis = [...taskUl.querySelectorAll("li")];
    let targetIndex = -1;
    let count = 0;
    for (let i = 0; i < lis.length; i++) {
      const spanInLi = lis[i].querySelector("span.task-text");
      if (!spanInLi) continue;
      if (spanInLi.textContent.trim() === oldText) {
        if (lis[i] === li) {
          targetIndex = count;
          break;
        }
        count++;
      }
    }
    if (targetIndex === -1) targetIndex = 0;

    const input = document.createElement("input");
    input.type = "text";
    input.value = oldText;
    input.className = "task-edit-input";
    input.style.fontSize = "1.5rem";
    input.style.width = "350px";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.background = "none";
    span.replaceWith(input);
    input.focus();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        try {
          let matchCount = -1;
          span.textContent = input.value;
          input.replaceWith(span);
          tasksInLocalstorage = tasksInLocalstorage.map((task) => {
            const spanStart = task.indexOf('<span class="task-text">');
            const spanEnd = task.indexOf("</span>");
            if (spanStart === -1 || spanEnd === -1) return task;

            const taskText = task.slice(spanStart + 24, spanEnd).trim();
            if (taskText === oldText) {
              matchCount++;
              if (matchCount === targetIndex) {
                return (
                  task.slice(0, spanStart + 24) +
                  span.textContent +
                  task.slice(spanEnd)
                );
              }
            }
            return task;
          });
          localStorage.setItem("tasks", JSON.stringify(tasksInLocalstorage));

          const url = "/api/update-task-list";
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newTaskList: tasksInLocalstorage }),
          });
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  // task checked
  if (e.target.classList.contains("checkbox")) {
    li.querySelector(".task-text").classList.toggle("checked");
    li.querySelector(".checkbox").setAttribute("checked", "");

    // update in db
    try {
      const allTasks = taskUl.innerHTML.trim().split("\n");
      tasksInLocalstorage = allTasks.map((task) => {
        return task.trim();
      });
      localStorage.setItem("tasks", JSON.stringify(tasksInLocalstorage));

      const url = "/api/update-task-list";
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTaskList: tasksInLocalstorage }),
      });
    } catch (err) {
      console.error(err);
    }
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
      try {
        todoTitle.textContent = input.value;
        input.replaceWith(todoTitle);
        const url = "/api/update-title";
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newTitle: todoTitle.textContent }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  });
});

shareLink.addEventListener("click", () => {
  shareModal.classList.remove("hidden");
  modalBackdrop.classList.remove("hidden");
  modalBackdrop.style.opacity = "0.5";
  shareModal.style.opacity = "1";
  shareModal.style.display = "flex";
});

modalBackdrop.addEventListener("click", (e) => {
  if (e.target.closest(".share-modal")) return;
  shareModal.classList.add("hidden");
  modalBackdrop.classList.add("hidden");
  shareModal.style.display = "none";
});
