import { Box } from "@mui/material";
import { t } from "i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import ButtonMUI from "@mui/material/Button";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { useState } from "react";

const DeleteAndMaybeRemoveButton: React.FC  = (id) => {
    let navigate = useNavigate();
    const user = useSelector(selectUser);
    const [showModal, setShowModal] = useState(false);
    const [selectedGraveId, setSelectedGraveId] = useState<string>();
    const handleShowModal = (id: string) => {
        setSelectedGraveId(id);
        setShowModal(true);
    };
    return (
        <Box sx={{ display: 'flex', gap: '1rem' }}>
            <ButtonMUI variant="contained"
                onClick={() => {
                navigate({
                    pathname: "/single-grave",
                    search: createSearchParams({
                    id: id.toString(),
                    }).toString(),
                });
                }} 
                >
                {t("details")}
            </ButtonMUI>
            {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                <ButtonMUI variant="contained" color="secondary"
                onClick={() => handleShowModal(id.toString())}
                >
                {t("delete")}
                </ButtonMUI>
            )}
        </Box>
    )
}

export { DeleteAndMaybeRemoveButton };