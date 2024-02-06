import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const statusMessageSuccess = "Email verified successfully!";
const statusMessageError = "Failed to verify email";

const EmailVerificationScreen = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] =
    useState("In progress..."); // https://react.dev/reference/react/useState#my-initializer-or-updater-function-runs-twice

  useEffect(() => {
    const handleVerifyLink = async () => {
      try {
        const response = await axios.put(`/api/users/verify-email`, {
          token: query,
        });
        setVerificationStatus("success");
        console.log(statusMessageSuccess, response.data);
      } catch (error) {
        setVerificationStatus("error");
        console.error(statusMessageError, error);
      }
    };
    console.log(verificationStatus);
    if (verificationStatus === "In progress...") {
      handleVerifyLink();
    }
  }, [verificationStatus, query]);

  let statusMessage = "In progress...";
  if (verificationStatus === "success") {
    statusMessage = statusMessageSuccess;
  } else if (verificationStatus === "error") {
    statusMessage = statusMessageError;
  }

  return (
    <div>
      <h1>{statusMessage}</h1>
    </div>
  );
};

export default EmailVerificationScreen;
