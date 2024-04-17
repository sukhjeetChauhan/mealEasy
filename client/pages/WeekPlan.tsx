import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RecipeDetail from '../components/RecipeDetailCard'
import Button from '../components/Button'

import useGetUserById from '../hooks/useGetUserById'
import { useAuth0 } from '@auth0/auth0-react'
import { addUser } from '../apis/backend-apis/users'
import useGetWeekById from '../hooks/useGetWeeks'
import { getRecipeById } from '../apis/backend-apis/recipes'
import useGetWeeksByUser from '../hooks/useGetWeeksByUsers'

export default function WeekPlan() {
  const initialDaysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]

  const [daysOfWeek, setDaysOfWeek] = useState(initialDaysOfWeek)
  const [mealPlan, setMealPlan] = useState({})
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [weekId, setweekId] = useState(2)
  const [weekPlan, setweekPlan] = useState([])

  const { user } = useAuth0()
  const auth = user?.sub
  // const userId = auth ?? '-1'

  const weeksArr = weekPlan?.map((item) => item.id)

  const { data: week } = useGetWeekById(weekId)
  const { data: userWeeks } = useGetWeeksByUser(auth)

  useEffect(() => {
    if (week) {
      const arr = [
        week.monday,
        week.tuesday,
        week.wednesday,
        week.thursday,
        week.friday,
        week.saturday,
        week.sunday,
      ]

      setMealPlan(
        arr.reduce((acc, meal, index) => {
          acc[initialDaysOfWeek[index]] = meal
          return acc
        }, {}),
      )
    }

    if (userWeeks) {
      setweekPlan(userWeeks)
    }
  }, [week, userWeeks])

  useEffect(() => {
    const getRecipes = async () => {
      try {
        const promises = Object.values(mealPlan).map((item) =>
          getRecipeById(item),
        )
        const recipes = await Promise.all(promises)
        setRecipes(recipes)
      } catch (error) {
        console.error('Error fetching recipes')
      }
    }
    getRecipes()
  }, [mealPlan])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleRecipeClick = (index) => {
    setSelectedRecipeIndex(index)
  }

  const handleDragStart = (e, day) => {
    e.dataTransfer.setData('text/plain', day)
  }

  const handleDrop = (e, targetDay) => {
    e.preventDefault()
    const draggedDay = e.dataTransfer.getData('text/plain')
    if (draggedDay !== targetDay) {
      const updatedMealPlan = { ...mealPlan }
      const temp = updatedMealPlan[targetDay]
      updatedMealPlan[targetDay] = updatedMealPlan[draggedDay]
      updatedMealPlan[draggedDay] = temp
      setMealPlan(updatedMealPlan)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  function renderRecipe(id: number) {
    setweekId(id)
  }

  // Add user
  // const { user } = useAuth0()
  // const auth = user?.sub
  const { data, isLoading, isError } = useGetUserById(auth)

  useEffect(() => {
    if (!data && !isLoading && !isError) {
      const newUser = {
        auth0_id: user?.sub,
        email: user?.email,
        first_name: user?.given_name,
        last_name: user?.family_name,
        nickname: user?.nickname,
      }
      addUser(newUser)
    }
  }, [data, isError, isLoading, user])

  if (isLoading) {
    return <p>Waiting on user details...</p>
  }
  if (isError) {
    console.error('Error with user')
    return null // or handle error UI
  }

  return (
    <div>
      <div className="relative flex flex-col items-center justify-center">
        <h1 className="mb-14 flex justify-center text-5xl text-headingGreen">
          Your week
        </h1>
        <Link to="recipes">
          <Button>Back to Recipes</Button>
        </Link>
      </div>
      <div className="dropdown relative">
        <div onClick={toggleDropdown} className="mt-5">
          <button className="hover:bg-buttonGreen text-buttonGreen focus:bg-buttonGreen btn bg-transparent hover:text-white focus:text-white">
            Select your week
          </button>
        </div>
        {isDropdownOpen && (
          <ul
            tabIndex={0}
            className=" text-buttonGreen right-100 menu dropdown-content menu-md absolute z-[2] mt-3 w-52 rounded-box bg-base-100 p-2 font-bold shadow"
          >
            {weeksArr.map((week) => (
              <li
                key={week}
                className="hover:bg-buttonGreen hover:rounded-lg hover:text-white"
              >
                <button
                  onClick={() => renderRecipe(week)}
                  className="focus:text-white"
                >{`Week ${week}`}</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-20 flex">
        <div>
          <div className="ml-12 flex flex-col items-start">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="mt-5 h-32">
                <h2 className="mb-1 text-xl font-semibold text-headingGreen">
                  {day}
                </h2>

                <div
                  className="hover:po hover:shadow-buttonGreen card card-side h-24 w-96 cursor-pointer bg-white shadow-sm hover:shadow-md"
                  draggable
                  onDragStart={(e) => handleDragStart(e, day)}
                  onDrop={(e) => handleDrop(e, day)}
                  onDragOver={handleDragOver}
                  onClick={() => handleRecipeClick(index)}
                >
                  <div className="m-auto flex">
                    <h2 className="card-title text-lg font-semibold">
                      {recipes[index]?.name || 'No Recipe'}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ml-40 mt-12">
          {selectedRecipeIndex !== null && (
            <RecipeDetail
              imageUrl={recipes[selectedRecipeIndex]?.image}
              recipeName={recipes[selectedRecipeIndex]?.name}
              ingredients={recipes[selectedRecipeIndex]?.ingredients.split('_')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
