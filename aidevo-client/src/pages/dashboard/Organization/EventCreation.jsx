import axios from "axios";
import Swal from "sweetalert2";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import CreateEventForm from '../../../components/forms/CreateEventForm';
import API from "../../../utils/api";

const EventCreation = () => {
  const handleCreateEvent = async (formData) => {
    try {
      let imageUrl = "";

      if (formData.cover) {
        imageUrl = await uploadToCloudinary(formData.cover);
      }

      const eventData = {
        ...formData,
        cover: imageUrl,
      };

      // const res = await axios.post("http://localhost:3000/events", eventData);
      const res = await API.post("/events", eventData);

      if (res.data.success) {
        Swal.fire({
          title: "Event Created!",
          text: "Your event has been successfully added.",
          icon: "success",
          confirmButtonColor: "#4bbeff",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Something went wrong",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10 px-4">
      <div className="mx-auto">
        <CreateEventForm onSubmit={handleCreateEvent} />
      </div>
    </div>
  );
};

export default EventCreation;
