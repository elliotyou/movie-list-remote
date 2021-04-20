const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
let preferedMode = 'brick'   //切換模式或頁數時參照用，預設為brick模式
let currentPage = 1         //切換模式或頁數時參照用，預設為第1頁
let filteredMovies = []
const movies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const switchMode = document.querySelector('#switch-mode')    //監聽切換模式icon的位置

//新增一個render函式，決定該用brick還是list。底下需要render的位置都統一改用此函式
function renderDataPanel(data) {
  preferedMode === 'brick' ? renderMovieInBrickMode(data) : renderMovieInListMode(data)
}

//原render函式，修改為適當名字
function renderMovieInBrickMode(data) {
  let rawHTML = ''

  data.forEach(item => {

    rawHTML += `
      <div class="col-sm-3 px-1">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" alt="Movie Poster" class="card-img-top">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
    dataPanel.innerHTML = rawHTML
  })
}

//新增一個render函式，專門呈現list模式用
function renderMovieInListMode(data) {
  let rawHTML = ''
  // < div class="col-12 my-1 border border-secondary" ></div >
  data.forEach(item => {
    rawHTML += `
      
      <div class="col-12 d-flex py-1 border-top">
        <div class="w-75">
          <p>${item.title}</p>
        </div>

        <div class="w-25">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
          data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>

      </div>
      
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((res) => {
    const data = res.data.results
    modalTitle.innerHTML = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie poster"class="img-flid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

switchMode.addEventListener('click', function onSwitchModeClicked(event) {
  if (event.target.matches('#brick-mode')) {
    preferedMode = 'brick'
  } else if (event.target.matches('#list-mode')) {
    preferedMode = 'list'
  }
  renderDataPanel(getMovieByPage(currentPage))  //切換模式時，重新修改preferedMode內容，抓取即有頁數來呈現
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  if (filteredMovies.length === 0) {
    return alert('Cannot find movie with ' + keyword)
  }
  currentPage = 1  //進行搜尋時，要將當前頁碼改為1，避免搜尋後再切換模式會取到錯誤的頁碼
  renderPaginator(filteredMovies.length)
  renderDataPanel(getMovieByPage(1))  //搜尋完的瞬間總是呈現第1頁
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  currentPage = page  //切換頁碼的同時要將當前頁碼一併修改
  renderDataPanel(getMovieByPage(page))
})

axios.get(INDEX_URL).then((res) => {
  movies.push(...res.data.results)
  renderDataPanel(getMovieByPage(currentPage))
  renderPaginator(movies.length)
})
