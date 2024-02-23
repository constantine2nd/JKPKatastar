import React, { useState, useEffect } from "react";
import axios from "axios";

const TestScreen = () => {
  const [deceased, setDeceased] = useState([]);
  const [filter, setFilter] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  useEffect(() => {
    // Fetch books when the component mounts or when filter or pagination changes
    fetchBooks();
  }, [filter, pagination.page]);

  const fetchBooks = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filter,
        ...pagination,
      }).toString();
      const response = await axios.get(`/api/deceased/paginate?${queryParams}`);
      const data = response.data;

      setDeceased(data.data);
      setPagination({
        ...pagination,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error("Error fetching deceased:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
    setPagination({ page: 1, limit: 10, totalPages: 1 });
  };

  const handlePageChange = (newPage) => {
    setPagination((prevPagination) => ({ ...prevPagination, page: newPage }));
  };

  return (
    <div>
      <h1>Deceased List</h1>

      <div>
        <label>Name: </label>
        <input type="text" name="name" onChange={handleFilterChange} />
        <label>Surname: </label>
        <input type="text" name="surname" onChange={handleFilterChange} />
      </div>

      <ul>
        {deceased.map((dec) => (
          <li key={dec._id}>
            {dec.name} {dec.surname}
          </li>
        ))}
      </ul>

      <div>
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          Previous Page
        </button>
        <span>
          {" "}
          Page {pagination.currentPage} of {pagination.totalPages}{" "}
        </span>
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          Next Page
        </button>
      </div>
    </div>
  );
};

export default TestScreen;
