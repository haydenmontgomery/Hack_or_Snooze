"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const star = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
        <div>
        ${showDeleteBtn ? getDeleteBTNHTML() : ""}
        ${star ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class ="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}


function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function getDeleteBTNHTML() {
  return `
      <span class = "trash-can">
        <i class="fas fa-trash-alt"></li>
      </span>`;
}

async function deleteStory(e) {
  console.debug("deleteStory");

  const $closestLi = $(e.target).closest("li");
  
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {

    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}


async function submitStory(e) {
  console.debug("submitNewStory");
  e.preventDefault();
  const author = $('create-author').val();
  const title = $('create-title').val();
  const url = $('create-url').val();

  const username = currentUser.username;
  const storyInfo = {title, url, author, username};

  const story = await storyList.addStory(currentUser, storyInfo);

  const $story = generateStoryMarkup(story);

  $allStoriesList.prepend($story);

  $submitForm.slideup("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitStory);

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownstories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    for (let story of currentUser.ownstories) {
      let  $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}


async function toggleStoryFavorite(e) {
  console.debug("toggleStoryFavorite");

  const $targets = $(evt.target);
  const $closestLi = $targets.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($targets.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $targets.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $targets.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);