// account logic
// show modal logic
let registerUserModalBtn = document.querySelector('#registerUser-modal');
let loginUserModalBtn = document.querySelector('#loginUser-modal');
let registerUserModalBlock = document.querySelector('#registerUser-block');
let loginUserModalBlock = document.querySelector('#loginUser-block');
let registerUserBtn = document.querySelector('#registerUser-btn');
let loginUserBtn = document.querySelector('#loginUser-btn');
let logoutUserBtn = document.querySelector('#logoutUser-btn');
let closeRegisterModalBtn = document.querySelector('.btn-close')
let createPostBtn = document.querySelector('#create-post-btn');
// console.log(registerUserModalBtn, loginUserModalBtn, registerUserModalBlock, loginUserModalBlock, registerUserBtn, loginUserBtn, logoutUserBtn);

registerUserModalBtn.addEventListener('click', () => {
       registerUserModalBlock.setAttribute('style', 'display: flex !important;');
       registerUserBtn.setAttribute('style', 'display: flex !important;');
       loginUserModalBlock.setAttribute('style', 'display: none !important;');
       loginUserBtn.setAttribute('style', 'display: none !important;')
});

loginUserModalBtn.addEventListener('click', () => {
       registerUserModalBlock.setAttribute('style', 'display: none !important;');
       registerUserBtn.setAttribute('style', 'display: none !important;');
       loginUserModalBlock.setAttribute('style', 'display: flex !important;');
       loginUserBtn.setAttribute('style', 'display: flex !important;')
});

// register logic
const USERS_API = 'http://localhost:8000/users';

// inputs group
let numberInp = document.querySelector('#reg-number')
let usernameInp = document.querySelector('#reg-username');
let ageInp = document.querySelector('#reg-age');
let passwordInp = document.querySelector('#reg-password');
let passwordConfirmInp = document.querySelector('#reg-passwordConfirm');
// console.log(usernameInp, ageInp, passwordInp, passwordConfirmInp, isAdminInp);

async function checkUniqueUsername(username) {
       let res = await fetch(USERS_API);
       let users = await res.json();
       // console.log(users);
       return users.some(item => item.username === username); // возвращает true или false из db
}
// checkUniqueUsername()

async function registerUser() {
       if (
              !numberInp.value.trim() ||
              !usernameInp.value.trim() ||
              !ageInp.value.trim() || 
              !passwordInp.value.trim() || 
              !passwordConfirmInp.value.trim() 
       ) {
              alert('Some inputs are empty!');
              return;
       }

       let uniqueUsername = await checkUniqueUsername(usernameInp.value); // ждем данные отправленные с инпута на проверке
       if (uniqueUsername) {
              alert('User with this username already exist!');
              return;
       };

       if (passwordInp.value !== passwordConfirmInp.value) {
              alert('Passwords dont match!');
              return;
       };

       let userObj = {
              number: numberInp.value,
              username: usernameInp.value,
              age: ageInp.value,
              password: passwordInp.value,
              favorites: []
       };
       // console.log(userObj);

       fetch(USERS_API, {
              method: 'POST',
              body: JSON.stringify(userObj),
              headers: {
                     'Content-Type': 'application/json;charset=utf-8'
              }
       })

       numberInp.value = ''
       usernameInp.value = '';
       ageInp.value = '';
       passwordInp.value = '';
       passwordConfirmInp.value = '';

       closeRegisterModalBtn.click();
};

registerUserBtn.addEventListener('click', registerUser);

// login logic
let showUsername = document.querySelector('#showUsername');

function checkLoginLogoutStatus() {
       let user = localStorage.getItem('user');
       if (!user) {
              loginUserModalBtn.parentNode.style.display = 'block';
              logoutUserBtn.parentNode.style.display = 'none';
              showUsername.innerText = 'No user';
              // createPostBtn.parentNode.style.display = 'none'
       } else {
              loginUserModalBtn.parentNode.style.display = 'none';
              logoutUserBtn.parentNode.style.display = 'block'
              showUsername.innerText = JSON.parse(user).username;
              // createPostBtn.parentNode.style.display = 'block'
       };
       showUserPanel();
};
// localStorage.setItem('user', JSON.stringify({username:'Jack', isAdmin: true}))
checkLoginLogoutStatus();

let loginUsernameInp = document.querySelector('#login-username');
let loginPasswordInp = document.querySelector('#login-password');

// проверка на наличие usera
function checkUserInUsers(username, users) {
       return users.some(item => item.username === username)
};

// проверка password
function checkUserPassword(user, password) {
       return user.password === password;
};

// добавление usera в local storage
function setUserToStorage(username, id, favorites) {
       localStorage.setItem('user', JSON.stringify({username, id, favorites}))
};

// получение usera в local storage
function getUserFromLocaleStorage() {
       let user = localStorage.getItem("user");
       let userObj = JSON.parse(user);
       return userObj;
};

async function loginUser() {
       if (
              !loginUsernameInp.value.trim() ||
              !loginPasswordInp.value.trim()
       ) {
              alert('Some inputs are empty!');
              return;
       }

       let res = await fetch(USERS_API);
       let users = await res.json();

       if (!checkUserInUsers(loginUsernameInp.value, users)) {
              alert('Users not found!');
              return;
       }; // 

       userObj = users.find(item => item.username === loginUsernameInp.value);

       if (!checkUserPassword(userObj, loginPasswordInp.value)) {
              alert('Wrong password!');
              return;
       };

       setUserToStorage(userObj.username, userObj.id, userObj.favorites);

       loginUsernameInp.value = '';
       loginPasswordInp.value = '';

       checkLoginLogoutStatus();

       closeRegisterModalBtn.click();

       render();
};
loginUserBtn.addEventListener('click', loginUser);

// logout logic
logoutUserBtn.addEventListener('click', () => {
       localStorage.removeItem('user');
       checkLoginLogoutStatus();
       addFavToDbJson()
       render();
});

// posrs logic
// create
function checkUserForPostCreate() {
       let user = JSON.parse(localStorage.getItem('user'));
       if (user) return user.id;
       return false;
};

function showUserPanel() {
       let userPanel = document.querySelector('.user-panel');
       if (!checkUserForPostCreate()) {
              userPanel.setAttribute('style', 'display: none !important;');
       } else {
              userPanel.setAttribute('style', 'display: flex !important;');
       };
};

let postTitle = document.querySelector('#post-title');
let postDesc = document.querySelector('#post-desc');
let postImage = document.querySelector('#post-image');
// console.log(postTitle, postImage, postDesc);

const POSTS_API = 'http://localhost:8000/posts';

async function createPost() {
       let userObj = getUserFromLocaleStorage();
       if (
              !postTitle.value.trim() ||
              !postDesc.value.trim() ||
              !postImage.value.trim()
       ) {
              alert('Some inputs are empty!');
              return;
       };

       let postObj = {
              title: postTitle.value,
              desc: postDesc.value,
              image: postImage.value,
              author: {
                     name: userObj.username,
                     id: userObj.id
              },
              likes: 0
       };

       // console.log(productObj);

       await fetch(POSTS_API, {
              method: 'POST',
              body: JSON.stringify(postObj),
              headers: {
                     'Content-Type': 'application/json;charset=utf-8'
              }
       });

       postTitle.value = '';
       postDesc.value = '';
       postImage.value = '';

       let btnCloseModalCreatePost = document.querySelector('#btn-close-create-post');
       btnCloseModalCreatePost.click();
       render();
};

let addPostBtn = document.querySelector('.add-post-btn');
addPostBtn.addEventListener('click', createPost);


// read
let currentPage = 1;
let search = '';
let category = '';

async function render() {
       let postsList = document.querySelector('#posts-list');
       postsList.innerHTML = '';

       // pagination and search parameters 
       let requestAPI = `${POSTS_API}?q=${search}&_page=${currentPage}&_limit=2`

       let res = await fetch(requestAPI); // поменяли PRODUCTS_API на requestAPI
       let posts = await res.json();

       posts.forEach(item => { 
              postsList.innerHTML += `<div class="card m-5 w-50" style="width: 18rem;">
                     <h4 class="card-title mt-3 mx-3">${item.title}</h5><hr>
                     <div class="card-body">
                            <img src="${item.image}" class="card-img-top img-fluid img-thumbnail" alt="error:(" height="200">
                            <p class="card-text my-4">${item.desc}</p>
                            ${
                                   checkUserForPostCreate() === item.author.id
                                     ? `
                      
                                     <a href="#" class="btn btn-outline-dark btn-edit" id="edit-${item.id}
                                      "
                                      data-bs-toggle="modal"
                                      data-bs-target="#exampleModal">Edit</a>
                                     <a href="#" class="btn btn-outline-danger btn-delete" id="del-${item.id}">Delete</a>`
                                  :
                                  ''
                            }
                            ${
                                   checkUserForPostCreate()
                                     ? `
                                     <a href="#" class="btn btn-outline-danger btn-like" id="like-${item.id}">
                                     <i class="bi bi-heart-fill"></i> ${item.likes}</a>
                                     `
                                  :
                                  `<a href="#" class="btn btn-outline-danger btn-like" id="like-${item.id}">
                                     <i class="bi bi-heart-fill"></i> ${item.likes}</a>`
                            }
                            
                     </div>
            </div>`
       });

       if (posts.length === 0) return;
       addDeleteEvent();
       addEditEvent();
       addLikeEvent();
};
render()

// delete
async function deletePost(e) {
       // console.log('OK');
       let postId = e.target.id.split('-')[1];
       // console.log(productId); 
       await fetch(`${POSTS_API}/${postId}`, {
              method: 'DELETE'
       });
       render();
};

function addDeleteEvent() {
       let deletePostBtn = document.querySelectorAll('.btn-delete');
       deletePostBtn.forEach(item => item.addEventListener('click', deletePost));
};

// update
let saveChangesBtn = document.querySelector('.save-changes-btn');

function checkCreateAndSaveBtn() {
       if (saveChangesBtn.id) {
              addPostBtn.setAttribute('style', 'display: none;');
              saveChangesBtn.setAttribute('style', 'display: block;');
       } else {
              addPostBtn.setAttribute('style', 'display: block;');
              saveChangesBtn.setAttribute('style', 'display: none;');
       };
};
checkCreateAndSaveBtn();    

async function addPostDataToForm(e) {
       let postId = e.target.id.split('-')[1];
       // console.log(postId);

       let res = await fetch(`${POSTS_API}/${postId}`); //retrive
       let postObj = await res.json();
       // console.log(postObj);

       postTitle.value = postObj.title;
       postDesc.value = postObj.desc;
       postImage.value = postObj.image;

       saveChangesBtn.setAttribute('id', postId); // or productId bez raznizi

       checkCreateAndSaveBtn();
};

function addEditEvent() {
       let editPostBtn = document.querySelectorAll('.btn-edit');
       editPostBtn.forEach(item => item.addEventListener('click', addPostDataToForm))
};

async function saveChanges(e) {
       let updatedPostObj = {
              id: e.target.id,
              title: postTitle.value,
              desc: postDesc.value,
              image: postImage.value,
       };

       await fetch(`${POSTS_API}/${e.target.id}`, {
              method: 'PATCH',
              body: JSON.stringify(updatedPostObj),
              headers: {
                     'Content-Type': 'application/json;charset=utf-8'
              }
       });

       postTitle.value = '';
       postDesc.value = '';
       postImage.value = '';

       saveChangesBtn.removeAttribute('id');

       checkCreateAndSaveBtn();
       let btnCloseModalCreatePost = document.querySelector('#btn-close-create-post');
       btnCloseModalCreatePost.click();
       render();
};

saveChangesBtn.addEventListener('click', saveChanges);

// search
let searchInp = document.querySelector('#search-inp');
searchInp.addEventListener('input', () => {
       search = searchInp.value;
       // console.log(search);
       currentPage = 1; 
       render();
});

// pagination
let prevPageBtn = document.querySelector('#prev-page-btn');
let nextPageBtn = document.querySelector('#next-page-btn');

async function getPagesCount() {
       let res = await fetch(POSTS_API);
       let posts = await res.json();
       let pagesCount = +Math.ceil(posts.length / 2);
       // console.log(pagesCount, typeof pagesCount);
       return pagesCount;
};

async function checkPages() {
       let maxPagesNum = await getPagesCount();
       if (currentPage === 1) {
              prevPageBtn.setAttribute('style', 'display: none');
              nextPageBtn.setAttribute('style', 'display: block');
       } else if (currentPage === maxPagesNum) {
              prevPageBtn.setAttribute('style', 'display: block');
              nextPageBtn.setAttribute('style', 'display: none');
       } else {
              prevPageBtn.setAttribute('style', 'display: block');
              nextPageBtn.setAttribute('style', 'display: block');
       }
};
checkPages();

prevPageBtn.addEventListener('click', () => {
       currentPage--;
       checkPages();
       render();
});

nextPageBtn.addEventListener('click', () => {
       currentPage++;
       checkPages();
       render();
});

function favToLocalStorage(obj) {
       localStorage.setItem("user", JSON.stringify(obj));
     };

async function likePost(e) {
       // let likeBtns = document.querySelectorAll(".btn-like");
       let postId = e.target.id.split("-")[1];
     
     
       let res = await fetch(POSTS_API);
       let posts = await res.json();
       let postObj = await posts.find((i) => i.id == postId);
     
     
       let user = getUserFromLocaleStorage();
       let likedUserPost = user.favorites.find((i) => i.id == postId);
       if (likedUserPost) {
         postObj.likes -= 1;
         await fetch(`${POSTS_API}/${postId}`, {
           method: "PATCH",
           body: JSON.stringify(postObj),
           headers: {
             "Content-Type": "application/json;charset=utf-8",
           },
         });
         let favorites = user.favorites.filter((i) => i.id != postId);
         user.favorites = favorites;
         fetch(`${USERS_API}/${user.id}`, {
           method: "PATCH",
           body: JSON.stringify({favorites: user.favorites}),
           headers: {
             "Content-Type": "application/json;charset=utf-8",
           },
         });
         favToLocalStorage(user);
         render();
         return;
       }
     
     
       postObj.likes += 1;
      
       user.favorites.push(postObj);
       fetch(`${USERS_API}/${user.id}`, {
         method: "PATCH",
         body: JSON.stringify({favorites: user.favorites}),
         headers: {
           "Content-Type": "application/json;charset=utf-8",
         },
       });
       favToLocalStorage(user);
     
     
       await fetch(`${POSTS_API}/${postId}`, {
         method: "PATCH",
         body: JSON.stringify(postObj),
         headers: {
           "Content-Type": "application/json;charset=utf-8",
         },
       });
       render()
};

     
function addLikeEvent() {
       let likeBtns = document.querySelectorAll(".btn-like");
       // likeBtns.forEach((item) => item.addEventListener("click", addFavToDbJson()));
       likeBtns.forEach((item) => item.addEventListener("click", likePost));

};