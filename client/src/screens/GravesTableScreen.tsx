import React, { useState, useEffect, useRef } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import axios from "axios";
import { Modal, Form, Row, Col, Button, Table } from "react-bootstrap";
import ButtonMUI from '@mui/material/Button';

import { dateFormatter } from "../utils/dateFormatter";
import {
  selectAllGraves,
  fetchGraves,
  getGravesStatus,
  getGravesError,
  deleteSingleGrave,
} from "../features/gravesSlice";
import "./GraveTableScreen.css";
import { GraveData } from "../interfaces/GraveIntefaces";
import Loader from "../components/Loader";
import Message from "../components/Message";

// MUI Table
import { styled } from '@mui/material/styles';
import TableMUI from '@mui/material/Table';
import TableBodyMUI from '@mui/material/TableBody';
import TableCellMUI, { tableCellClasses } from '@mui/material/TableCell';
import TableContainerMUI from '@mui/material/TableContainer';
import TableHeadMUI from '@mui/material/TableHead';
import TableRowMUI from '@mui/material/TableRow';
import PaperMUI from '@mui/material/Paper';

// MUI Data Grid
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
// MUI Chip
import Chip from '@mui/material/Chip';


const capacity = (capacity: string, numberOfDeceaseds: string) => {
  let result = null;
  const capacityNum = Number(capacity);
  const deceasedsNum = Number(numberOfDeceaseds);
  if (capacityNum - deceasedsNum === 0) {
    result = <Chip label={`${numberOfDeceaseds}/${capacity}`} color="error" />;
  } else if (deceasedsNum / capacityNum > 0.49) {
    result = <Chip label={`${numberOfDeceaseds}/${capacity}`} color="warning" />;
  } else {
    result = <Chip label={`${numberOfDeceaseds}/${capacity}`} color="success" />;
  }
  return result;
}

const expiredContract = (contractTo: string) => {
  let result = null;
  let contractDate = new Date(contractTo);
  let contractDatePlus = new Date(contractTo);
  contractDatePlus.setMonth(contractDatePlus.getMonth() - 3);
  let today = new Date();
  if (today > contractDate) {
    result = <Chip label={dateFormatter(contractTo)} color="error" />;
  } else if (today > contractDatePlus) {
    result = <Chip label={dateFormatter(contractTo)} color="warning" />;
  } else {
    result = <Chip label={dateFormatter(contractTo)} color="success" />;
  }
  return result;
}

const GravesTableScreen: React.FC = () => {
  //const [graves, setGraves] = useState<GraveData[]>([]);
  let navigate = useNavigate();
  const graves: GraveData[] = useSelector(selectAllGraves);
  const gravesStatus = useSelector(getGravesStatus);
  const error = useSelector(getGravesError);
  const dispatch = useDispatch<any>();
  const [showModal, setShowModal] = useState(false);
  const [selectedGraveId, setSelectedGraveId] = useState<string>();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (gravesStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchGraves());
    }
  }, [gravesStatus, dispatch]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGraveId("");
  };

  const handleShowModal = (id: string) => {
    setSelectedGraveId(id);
    setShowModal(true);
  };

  const handleDeleteGrave = () => {
    if (selectedGraveId) {
      dispatch(deleteSingleGrave(selectedGraveId));
      setShowModal(false);
    }
  };

  if (gravesStatus === "loading") {
    return <Loader />;
  }

  if (gravesStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  const StyledTableCell = styled(TableCellMUI)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: '#1976d2',
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRowMUI)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  

  return (
    <>
      <div
        style={{
          height: "50vw",
          width: "100%",
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>{t("graves-table-screen")}</div>
        <br />
        <ButtonMUI variant="contained" sx={{m: 2}}
          onClick={() => {
            navigate({
              pathname: "/add-grave",
            });
          }}
        >{t("add grave")}
        </ButtonMUI>
        <br />
        

        <div>
        {graves.length !== 0 && (
        <TableContainerMUI component={PaperMUI}>
          <TableMUI sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHeadMUI>
              <TableRowMUI>
                <StyledTableCell>#</StyledTableCell>
                <StyledTableCell>{t("number")}</StyledTableCell>
                <StyledTableCell align="right">{t("field")}</StyledTableCell>
                <StyledTableCell align="right">{t("row")}</StyledTableCell>
                <StyledTableCell align="right">{t("occupation")}</StyledTableCell>
                <StyledTableCell align="right">{t("contract-expiration-date")}</StyledTableCell>
                <StyledTableCell align="right"></StyledTableCell>
                <StyledTableCell align="right"></StyledTableCell>
              </TableRowMUI >
            </TableHeadMUI >
            <TableBodyMUI >
              {graves.map((grave, index) => (
                <StyledTableRow key={index + 1}>
                  <StyledTableCell component="th" scope="row">{index + 1}</StyledTableCell>
                  <StyledTableCell align="right">{grave.number}</StyledTableCell>
                  <StyledTableCell align="right">{grave.field}</StyledTableCell>
                  <StyledTableCell align="right">{grave.row}</StyledTableCell>
                  <StyledTableCell align="right">{capacity(grave.capacity, grave.numberOfDeceaseds)}</StyledTableCell>
                  <StyledTableCell align="right">{expiredContract(grave.contractTo)}</StyledTableCell>
                  <StyledTableCell align="right">
                    <ButtonMUI variant="contained" 
                        onClick={() => {
                          navigate({
                            pathname: "/single-grave",
                            search: createSearchParams({
                              id: grave._id,
                            }).toString(),
                          });
                        }}
                      >
                        {t("details")}
                      </ButtonMUI>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <ButtonMUI variant="contained" color="secondary" onClick={() => handleShowModal(grave._id)}>
                      {t("delete")}
                    </ButtonMUI>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBodyMUI>
          </TableMUI>
        </TableContainerMUI>
        )}

        </div>
        <br />
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Brisanje grobnog mesta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Da li ste sigurni da zelite da izbrisete grobno mesto?
        </Modal.Body>
        <Modal.Footer>
          <ButtonMUI color="secondary" onClick={handleCloseModal}>
            Nazad
          </ButtonMUI>
          <ButtonMUI color="primary" onClick={handleDeleteGrave}>
            Da
          </ButtonMUI>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GravesTableScreen;
