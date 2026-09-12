import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  const [, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileRole, setProfileRole] = useState("");
  const [about, setAbout] = useState("");

  const [profileImage, setProfileImage] = useState("");
  const [imageEdited, setImageEdited] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await API.get("/profile");

        const data = response.data;

        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setProfileRole(data.profileRole || "");
        setAbout(data.about || "");
        setProfileImage(data.profileImage || "");
      } catch (error) {
        console.log("Error loading profile:", error);
        setMessage("Unable to load profile.");
      }
    };

    loadProfile();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfileImage(reader.result);
      setZoom(1);
      setPositionX(50);
      setPositionY(50);
      setImageEdited(true);
      setMessage("");
    };

    reader.readAsDataURL(file);
  };

  const resetImageAdjustment = () => {
    setZoom(1);
    setPositionX(50);
    setPositionY(50);
    setImageEdited(true);
  };

  const createCroppedImage = () => {
    return new Promise((resolve, reject) => {
      const image = imageRef.current;

      if (!image || !image.naturalWidth || !image.naturalHeight) {
        reject(new Error("Image is not ready yet."));
        return;
      }

      const canvas = document.createElement("canvas");
      const outputSize = 700;

      canvas.width = outputSize;
      canvas.height = outputSize;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Canvas is not supported."));
        return;
      }

      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;

      /*
        Choose a square crop from the original image.

        Zoom controls how small the visible source area becomes.
        Horizontal and Vertical control the crop's focal point.

        The crop is always kept inside the original image,
        so the saved image can never contain blank areas.
      */
      const cropSize =
        Math.min(sourceWidth, sourceHeight) / zoom;

      const maxX = sourceWidth - cropSize;
      const maxY = sourceHeight - cropSize;

      const cropX = (positionX / 100) * maxX;
      const cropY = (positionY / 100) * maxY;

      context.drawImage(
        image,
        cropX,
        cropY,
        cropSize,
        cropSize,
        0,
        0,
        outputSize,
        outputSize
      );

      resolve(canvas.toDataURL("image/jpeg", 0.9));
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      let finalImage = profileImage;

      if (profileImage && imageEdited) {
        finalImage = await createCroppedImage();
      }

      const token = localStorage.getItem("token");

      const response = await API.post(
        "/profile",
        {
          name,
          email,
          profileRole,
          about,
          profileImage: finalImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data);
      setProfileImage(response.data.profileImage || finalImage);
      setImageEdited(false);

      setMessage("Profile updated successfully!");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log("Error updating profile:", error);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>Edit Profile</h1>
          <p>Manage your personal information and profile picture.</p>
        </div>

        <button
          className="back-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {message && (
        <div
          className={
            message.includes("successfully")
              ? "profile-success-message"
              : "profile-error-message"
          }
        >
          {message}
        </div>
      )}

      <form className="profile-card profile-editor-card" onSubmit={handleSave}>
        <div className="profile-image-editor">
          <div className="profile-image-heading">
            <div>
              <h2>Profile Picture</h2>
              <p>Upload and adjust how your picture appears.</p>
            </div>
          </div>

          <div className="profile-crop-preview">
            {profileImage ? (
              <img
                ref={imageRef}
                src={profileImage}
                alt={name || "Profile"}
                className="profile-crop-image"
                style={{
                  objectPosition: `${positionX}% ${positionY}%`,
                  transform: `scale(${zoom})`,
                }}
              />
            ) : (
              <div className="profile-crop-placeholder">
                {name
                  ? name.charAt(0).toUpperCase()
                  : "A"}
              </div>
            )}

            {profileImage && (
              <div className="profile-crop-frame">
                <span>Preview</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />

          <button
            type="button"
            className="profile-upload-button"
            onClick={() => fileInputRef.current?.click()}
          >
            {profileImage ? "Change Image" : "Upload Image"}
          </button>

          {profileImage && (
            <div className="profile-image-controls">
              <div className="profile-control">
                <div className="profile-control-label">
                  <label htmlFor="profile-zoom">
                    Zoom
                  </label>
                  <span>{zoom.toFixed(1)}×</span>
                </div>

                <input
                  id="profile-zoom"
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => {
                    setZoom(Number(e.target.value));
                    setImageEdited(true);
                  }}
                />
              </div>

              <div className="profile-control">
                <div className="profile-control-label">
                  <label htmlFor="profile-position-x">
                    Horizontal
                  </label>
                  <span>{positionX}%</span>
                </div>

                <input
                  id="profile-position-x"
                  type="range"
                  min="0"
                  max="100"
                  value={positionX}
                  onChange={(e) => {
                    setPositionX(Number(e.target.value));
                    setImageEdited(true);
                  }}
                />
              </div>

              <div className="profile-control">
                <div className="profile-control-label">
                  <label htmlFor="profile-position-y">
                    Vertical
                  </label>
                  <span>{positionY}%</span>
                </div>

                <input
                  id="profile-position-y"
                  type="range"
                  min="0"
                  max="100"
                  value={positionY}
                  onChange={(e) => {
                    setPositionY(Number(e.target.value));
                    setImageEdited(true);
                  }}
                />
              </div>

              <button
                type="button"
                className="profile-reset-image-button"
                onClick={resetImageAdjustment}
              >
                Reset Position
              </button>
            </div>
          )}

          <small className="profile-image-help">
            Use the sliders to choose the exact portion of
            the image you want to show.
          </small>
        </div>

        <div className="profile-form">
          <div className="form-group">
            <label htmlFor="profile-name">Name</label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-role">Professional Title</label>

            <input
              id="profile-role"
              type="text"
              value={profileRole}
              onChange={(e) => setProfileRole(e.target.value)}
              placeholder="e.g. Full Stack Developer"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">Email</label>

            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-about">About</label>

            <textarea
              id="profile-about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Write something about yourself..."
              rows="7"
            />
          </div>

          <button
            type="submit"
            className="save-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
