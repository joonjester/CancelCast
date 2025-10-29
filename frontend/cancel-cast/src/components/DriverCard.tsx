import { Avatar, Box, Card, Typography } from "@mui/joy";
import { Star, LocationOn, DirectionsCar } from "@mui/icons-material";
import { Driver } from "../custom-types/custom-types";

type DriverCardProps = {
  driver: Driver;
};

const DriverCard = ({ driver }: DriverCardProps) => {
  const predictionLogRegColor =
    (driver.predictionLogReg || 0) >= 10
      ? "danger"
      : (driver.predictionLogReg || 0) >= 5
      ? "warning"
      : "success";

  const predictionRfColor =
    (driver.predictionRf || 0) >= 10
      ? "danger"
      : (driver.predictionRf || 0) >= 5
      ? "warning"
      : "success";

  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 450,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: 0,
        borderRadius: "lg",
        boxShadow: "0px 2px 4px rgba(246, 244, 241, 0.6)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: "white",
            color: "#667eea",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          {driver.driver_name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography level="h3" sx={{ color: "white", mb: 0.5 }}>
            {driver.driver_name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DirectionsCar sx={{ color: "white", fontSize: "1rem" }} />
            <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
              {driver.vehicle_type || "N/A"}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Star sx={{ color: "#ffd700", fontSize: "1.2rem" }} />
          <Typography level="h4" sx={{ color: "white" }}>
            {(driver.driver_rating || 0).toFixed(1)}
          </Typography>
        </Box>
      </Box>

      {/* Info Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
          bgcolor: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          borderRadius: "md",
          p: 2,
        }}
      >
        <Box>
          <Typography
            level="body-xs"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 0.5 }}
          >
            Booking Value
          </Typography>
          <Typography level="h4" sx={{ color: "white" }}>
            ${(driver.booking_value || 0).toFixed(1)}
          </Typography>
        </Box>

        <Box>
          <Typography
            level="body-xs"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 0.5 }}
          >
            Distance
          </Typography>
          <Typography level="h4" sx={{ color: "white" }}>
            {(driver.ride_distance || 0).toFixed(1)} km
          </Typography>
        </Box>

        <Box>
          <Typography
            level="body-xs"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 0.5 }}
          >
            Avg VTAT
          </Typography>
          <Typography level="h4" sx={{ color: "white" }}>
            {(driver.avg_vtat || 0).toFixed(1)} min
          </Typography>
        </Box>

        <Box>
          <Typography
            level="body-xs"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 0.5 }}
          >
            Avg CTAT
          </Typography>
          <Typography level="h4" sx={{ color: "white" }}>
            {(driver.avg_ctat || 0).toFixed(1)} min
          </Typography>
        </Box>
      </Box>

      {/* Location Info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
          p: 1.5,
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: "sm",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocationOn sx={{ color: "#4ade80", fontSize: "1.2rem" }} />
          <Box>
            <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Pickup
            </Typography>
            <Typography sx={{ color: "white" }}>
              {driver.pickup_location || "N/A"}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "1.5rem" }}>
          →
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocationOn sx={{ color: "#f87171", fontSize: "1.2rem" }} />
          <Box>
            <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Drop-off
            </Typography>
            <Typography sx={{ color: "white" }}>
              {driver.drop_location || "N/A"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Prediction Badge */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
          p: 1.5,
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: "sm",
        }}
      >
        <Box>
          <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Cancellatoin liklihood with Logistic Regression
          </Typography>
          <Typography level="h4" color={predictionLogRegColor}>
            {driver.predictionLogReg}%
          </Typography>
        </Box>
        <Box>
          <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Cancellation liklihood with Random Forest
          </Typography>
          <Typography level="h4" color={predictionRfColor}>
            {driver.predictionRf}%
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default DriverCard;
