import React, { Component } from "react";
import ResultCard from "../ResultCard";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineClose } from "react-icons/md";
import { TailSpin } from "react-loader-spinner";
import "./index.css";

// List of body parts for filtering exercises
const bodyPartsList = [
  "chest",
  "back",
  "biceps",
  "triceps",
  "legs",
  "shoulders",
  "core",
  "glutes",
];

class Request extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedEquipments: [], // List of currently selected equipment
      inputEquipmentName: "", // Value of the equipment search input
      equipmentsSearchList: [], // List of equipments matching the search query
      selectedBodyPart: "", // Selected body part for the exercise search
      numExercises: 1, // Number of exercises to retrieve
      showBodyPartsList: false, // Toggle for displaying body parts list
      exercises: [], // List of exercises returned from the API
      errorMessage: "", // Error message to display
      isLoading: false, // Loading state for the submit button
    };
    this.resultSectionRef = React.createRef(); // Reference to the result section
  }

  // Render a search item for equipment
  renderEquipmentSearchItem = (itemDetails) => {
    const { image, name } = itemDetails;

    return (
      <li
        className="equipment-search-item"
        onClick={() => {
          this.setState((prevState) => ({
            selectedEquipments: [...prevState.selectedEquipments, itemDetails],
            inputEquipmentName: "",
            equipmentsSearchList: [],
          }));
        }}
      >
        <img alt={name} src={image} className="equipment-image" />
        <p className="equipment-name">{name}</p>
      </li>
    );
  };

  // Handle changes in the equipment search input
  onChangeEquipmentName = async (event) => {
    const name = event.target.value;
    this.setState({
      inputEquipmentName: name,
    });

    // Clear the search list if the input is empty
    if (name.length === 0) {
      this.setState({
        equipmentsSearchList: [],
      });
      return;
    }

    try {
      // Fetch equipment from the server based on the search query
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/equipments?name=${name}`
      );
      if (response.ok) {
        const data = await response.json();
        const { selectedEquipments } = this.state;

        // Filter out the equipments that are already selected
        const filteredEquipments = data.equipments.filter(
          (equipment) =>
            !selectedEquipments.some(
              (selected) => selected.name === equipment.name
            )
        );

        this.setState({
          equipmentsSearchList: filteredEquipments,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  // Remove selected equipment from the list
  removeEquipment = (event) => {
    const { selectedEquipments } = this.state;
    const selectedName = event.target.id;
    const filteredEquipments = selectedEquipments.filter((eachItem) => {
      return eachItem.name !== selectedName;
    });
    this.setState({
      selectedEquipments: filteredEquipments,
    });
  };

  // Render a card for selected equipment
  renderSelectedEquipment = (itemDetails) => {
    const { name, image } = itemDetails;
    return (
      <li className="selected-equipment-card">
        <img alt={name} src={image} className="selected-equipment-image" />
        <h5 className="selected-equipment-name">{name}</h5>

        <MdOutlineClose
          id={name}
          onClick={this.removeEquipment}
          className="close-icon"
        />
      </li>
    );
  };

  // Validate input fields before making the API request
  checkInputs = () => {
    const { selectedBodyPart, numExercises } = this.state;
    let message = "";
    if (selectedBodyPart === "") {
      message = "please select any body part";
    } else if (numExercises === "") {
      message = "please specify count";
    }
    if (message) {
      this.setState({
        errorMessage: message,
      });
      return true;
    }
    this.setState({
      errorMessage: "",
    });
    return false;
  };

  // Fetch exercises based on selected criteria
  getExcercises = async (event) => {
    event.preventDefault();

    const stopProcess = this.checkInputs();
    if (stopProcess) {
      return;
    }

    this.setState({
      isLoading: true, // Set loading to true before making the request
    });

    const { selectedEquipments, selectedBodyPart, numExercises } = this.state;

    // Prepare query parameters
    const equipmentNames = selectedEquipments.map((equipment) =>
      equipment.name.toLowerCase()
    );
    const equipmentsString = equipmentNames.join(",");

    const bodyPart = selectedBodyPart;
    const count = numExercises;

    try {
      // Fetch exercises from the server with the specified parameters
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/exercises?bodyPart=${bodyPart}&limit=${count}&equipments=${equipmentsString}`
      );

      if (response.ok) {
        const data = await response.json();

        this.setState(
          {
            exercises: data,
            isLoading: false, // Reset loading state
            selectedEquipments: [],
            inputEquipmentName: "",
            equipmentsSearchList: [],
            selectedBodyPart: "",
            numExercises: 1,
            showBodyPartsList: false,
          },
          () => {
            if (this.state.exercises.length === 0) {
              this.setState({
                errorMessage: "sorry! we couldn't find any exercises",
              });
              return;
            }

            // Scroll to the result section after state has updated
            this.resultSectionRef.current.scrollIntoView({
              behavior: "smooth",
            });
          }
        );
      } else {
        this.setState({
          isLoading: false,
          errorMessage: "Failed to fetch exercises",
        });
      }
    } catch (error) {
      this.setState({
        errorMessage: "Failed to fetch exercises",
        isLoading: false,
      });
    }
  };

  render() {
    const {
      selectedEquipments,
      inputEquipmentName,
      equipmentsSearchList,
      selectedBodyPart,
      numExercises,
      showBodyPartsList,
      exercises,
      errorMessage,
      isLoading,
    } = this.state;

    return (
      <div className="request-section">
        <div className="request-main-section">
          <img
            alt="home-page-image"
            src="https://res.cloudinary.com/dpla1hz0i/image/upload/v1725371061/sample_fit_img-transformed_vguqre.jpg"
            className="home-page-image"
          />
          <form className="request-form" onSubmit={this.getExcercises}>
            <div className="text-container">
              <h1 className="main-heading">Find Exercises</h1>
              <p className="main-description">
                Discover exercises by selecting the equipment and body part you
                want to train
              </p>
            </div>
            <label htmlFor="equipments">Equipments</label>
            <div className="selected-equipments-container">
              {selectedEquipments.length === 0
                ? "Select equipment by searching below"
                : selectedEquipments.map((eachItem) => {
                    return this.renderSelectedEquipment(eachItem);
                  })}
            </div>
            <input
              id="equipments"
              name="equipments"
              type="text"
              placeholder="search equipment by name"
              value={inputEquipmentName}
              onChange={this.onChangeEquipmentName}
            />
            {equipmentsSearchList.length > 0 && (
              <div className="equipments-search-list-container">
                <ul className="equipments-search-list">
                  {equipmentsSearchList.map((eachItem) => {
                    return this.renderEquipmentSearchItem(eachItem);
                  })}
                </ul>
              </div>
            )}

            <div className="bodyPart-and-numberOfExcercises-card">
              <div className="bodyPart-card">
                <label htmlFor="bodyPart">Body Part</label>
                <div
                  id="bodyPart"
                  name="bodyPart"
                  className="body-part-header"
                  onClick={() => {
                    this.setState((prevState) => ({
                      showBodyPartsList: !prevState.showBodyPartsList,
                    }));
                  }}
                >
                  <span>
                    {selectedBodyPart ? selectedBodyPart : "Select body part"}
                  </span>{" "}
                  <IoIosArrowDown
                    className={`down-arrow ${showBodyPartsList && "rotate"}`}
                  />
                </div>

                <div
                  className="body-part-list-card"
                  style={{ display: !showBodyPartsList && "none" }}
                >
                  <ul className="body-part-list">
                    {bodyPartsList.map((eachItem) => {
                      return (
                        <li
                          onClick={() => {
                            this.setState({
                              showBodyPartsList: false,
                              selectedBodyPart: eachItem,
                            });
                          }}
                          className="body-part"
                        >
                          {eachItem}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="numberOfExcercises-card">
                <label htmlFor="exercisesCount">No. of exercises</label>
                <input
                  id="exercisesCount"
                  type="number"
                  placeholder="no of exercises"
                  value={numExercises}
                  onChange={(e) =>
                    this.setState({ numExercises: e.target.value })
                  }
                  min="1" // Minimum value to prevent 0 or negative numbers
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              style={{ opacity: isLoading ? "0.6" : "1" }}
            >
              {isLoading && (
                <TailSpin
                  type="ThreeDots"
                  color="white"
                  height="16"
                  width="16"
                />
              )}{" "}
              {isLoading ? "Getting Exercises" : "Get Exercises"}
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </form>
        </div>
        {exercises.length > 0 && (
          <div
            id="result-section"
            className="result-section"
            ref={this.resultSectionRef}
          >
            <h2 className="result-section-heading">Your Excercises</h2>

            <ul className="exercises-list">
              {exercises.map((eachItem) => {
                return <ResultCard resultCard={eachItem} />;
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default Request;
