import { useAuth0 } from '@auth0/auth0-react'
import React, { useState } from 'react'
import useGetUserPreference from '../hooks/useGetUserPreferences'
import useGetApiRecipes from '../hooks/useGetApiRecipes'
import RecipeDetail from './RecipeDetailCard'

export default function RecipeCardMedium() {
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(null)

  const { user } = useAuth0()

  const auth = user?.sub
  const userId = auth ?? '-1'

  const { data: userPreference } = useGetUserPreference(userId)
  const searchString = userPreference
    ?.map((pref) => `&${pref.type}=${pref.name}`)
    .join('')

  const string = searchString ?? '-1'

  const { data, isLoading, isError } = useGetApiRecipes(string)
  if (isLoading) {
    return <p>is Loading ...</p>
  }

  if (isError) {
    return <p>An Error has occurred. </p>
  }

  if (data) {
    const meals = data.hits.map((item) => {
      const obj = {}
      obj.name = item.recipe.label
      obj.image = item.recipe.images
      obj.ingredients = item.recipe.ingredientLines
      return obj
    })
    console.log(meals)

    // const meals = [
    //   {
    //     name: 'Butter Chicken',
    //     image:
    //       'https://img.taste.com.au/sL0izJWj/w643-h428-cfill-q90/taste/2016/11/butter-chicken-101831-1.jpeg',
    //   },
    //   {
    //     name: 'Spaghetti Carbonara',
    //     image:
    //       'https://hips.hearstapps.com/hmg-prod/images/carbonara-index-6476367f40c39.jpg?crop=0.888888888888889xw:1xh;center,top&resize=1200:*',
    //   },
    //   {
    //     name: 'Sushi',
    //     image:
    //       'https://img.taste.com.au/3mYHXsD_/taste/2016/11/sushi-for-kids-81300-1.jpeg',
    //   },
    //   {
    //     name: 'Butter Chicken',
    //     image:
    //       'https://img.taste.com.au/sL0izJWj/w643-h428-cfill-q90/taste/2016/11/butter-chicken-101831-1.jpeg',
    //   },
    //   {
    //     name: 'Spaghetti Carbonara',
    //     image:
    //       'https://hips.hearstapps.com/hmg-prod/images/carbonara-index-6476367f40c39.jpg?crop=0.888888888888889xw:1xh;center,top&resize=1200:*',
    //   },
    //   {
    //     name: 'Sushi',
    //     image:
    //       'https://img.taste.com.au/3mYHXsD_/taste/2016/11/sushi-for-kids-81300-1.jpeg',
    //   },
    //   {
    //     name: 'Butter Chicken',
    //     image:
    //       'https://img.taste.com.au/sL0izJWj/w643-h428-cfill-q90/taste/2016/11/butter-chicken-101831-1.jpeg',
    //   },
    //   {
    //     name: 'Spaghetti Carbonara',
    //     image:
    //       'https://hips.hearstapps.com/hmg-prod/images/carbonara-index-6476367f40c39.jpg?crop=0.888888888888889xw:1xh;center,top&resize=1200:*',
    //   },
    //   {
    //     name: 'Sushi',
    //     image:
    //       'https://img.taste.com.au/3mYHXsD_/taste/2016/11/sushi-for-kids-81300-1.jpeg',
    //   },
    // ]

    const handleShowRecipeDetail = (index) => {
      setSelectedRecipeIndex(index)
    }

    const handleToggleSelection = (index) => {
      const selectedIndex = selectedItems.indexOf(index)
      if (selectedIndex === -1) {
        setSelectedItems([...selectedItems, index])
      } else {
        const updatedSelection = [...selectedItems]
        updatedSelection.splice(selectedIndex, 1)
        setSelectedItems(updatedSelection)
      }
    }

    const isMealSelected = (index) => selectedItems.includes(index)
    const isSelectionFull = selectedItems.length >= 7

    const handleDetailClick = () => {
      setSelectedRecipeIndex(null) // closing detail view when detail is clicked
    }

    console.log(selectedRecipeIndex)

    return (
      <div className="relative flex flex-col items-center justify-center">
        <div className="flex flex-wrap justify-start">
          {meals.map((meal, index) => (
            <div key={index} className="m-4 w-96">
              <div
                className={`card card-compact relative bg-base-100 bg-white shadow-xl ${
                  isMealSelected(index) ? 'border-4 border-green-500' : ''
                } ${isSelectionFull && !isMealSelected(index) ? 'opacity-50' : ''}`}
              >
                <figure onClick={() => handleShowRecipeDetail(index)}>
                  <img
                    className="ml-3 mt-3 h-40 w-64 rounded"
                    src={meal.image.REGULAR.url}
                    alt={meal.name}
                  />
                </figure>
                <div
                  className="card-body"
                  onClick={() => handleShowRecipeDetail(index)}
                >
                  <h2 className="card-title">{meal.name}</h2>
                  <p>Some description about the meal goes here.</p>
                </div>
                <div className="absolute right-2 top-2">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMealSelected(index)}
                        onChange={() => handleToggleSelection(index)}
                        className="checkbox-primary checkbox"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {isSelectionFull && (
          <div className="fixed left-0 top-0 w-full bg-red-500 py-2 text-center text-white">
            You have selected seven meals. You cannot select more.
          </div>
        )}
        {selectedRecipeIndex !== null && ( // render RecipeDetail component if a recipe is selected
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={handleDetailClick}
          >
            <div className="z-10">
              <RecipeDetail
                imageUrl={meals[selectedRecipeIndex].image.REGULAR.url}
                recipeName={meals[selectedRecipeIndex].name}
              />
            </div>
          </div>
        )}
      </div>
    )
  }
}