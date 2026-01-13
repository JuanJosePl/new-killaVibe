export const customerErrorNormalizer = (error) => {
  if (error?.response) {
    return {
      message: error.response.data?.message || "Error del servidor",
      status: error.response.status,
    };
  }

  if (error?.request) {
    return {
      message: "No hay respuesta del servidor",
      status: null,
    };
  }

  return {
    message: error.message || "Error desconocido",
    status: null,
  };
};
    