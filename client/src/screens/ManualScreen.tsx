import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { OFFICER, ADMINISTRATOR, MAINTAINER } from "../utils/constant.js";
import { marked } from "marked";
import { Box, CircularProgress, Typography } from "@mui/material";

function manualFileForRole(role?: string): string {
  if (role === MAINTAINER) return "/manuals/uputstvo-odrzavalac.md";
  if (role === ADMINISTRATOR) return "/manuals/uputstvo-administrator.md";
  if (role === OFFICER) return "/manuals/uputstvo-sluzbenik.md";
  return "/manuals/uputstvo-posetilac.md";
}

const ManualScreen = () => {
  const user = useSelector(selectUser);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const file = manualFileForRole(user?.role);
    setLoading(true);
    setError(false);
    fetch(file)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [user?.role]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Упутство није доступно.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: 4,
        "& h1": { fontSize: "2rem", fontWeight: 700, mb: 2, mt: 0 },
        "& h2": { fontSize: "1.5rem", fontWeight: 600, mt: 4, mb: 1 },
        "& h3": { fontSize: "1.2rem", fontWeight: 600, mt: 3, mb: 1 },
        "& p": { mb: 1.5, lineHeight: 1.7 },
        "& ul, & ol": { pl: 3, mb: 1.5 },
        "& li": { mb: 0.5 },
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          mb: 2,
          fontSize: "0.9rem",
        },
        "& th": {
          textAlign: "left",
          borderBottom: "2px solid",
          borderColor: "divider",
          py: 1,
          px: 1.5,
          fontWeight: 600,
          bgcolor: "action.hover",
        },
        "& td": {
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 0.75,
          px: 1.5,
          verticalAlign: "top",
        },
        "& tr:hover td": { bgcolor: "action.hover" },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "primary.main",
          pl: 2,
          ml: 0,
          my: 2,
          color: "text.secondary",
          fontStyle: "italic",
        },
        "& code": {
          bgcolor: "action.selected",
          px: 0.5,
          borderRadius: 0.5,
          fontFamily: "monospace",
          fontSize: "0.85em",
        },
        "& hr": { my: 3, borderColor: "divider" },
        "& a": { color: "primary.main" },
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: marked(content) as string }} />
    </Box>
  );
};

export default ManualScreen;
