export function fileToBase64(file: File): Promise<string> {

    return new Promise((resolve, reject) => {
        if (!(file instanceof File)) {
            reject(new Error("Le paramètre fourni n'est pas un objet File valide."));
            return;
        }

        const reader = new FileReader();

        // Lecture du fichier en Data URL (Base64)
        reader.readAsDataURL(file)
        

        reader.onload = () => {
            const result = reader.result as string;
           resolve(result);
        }
        reader.onerror = (error) => {
            reject(new Error(`Erreur lors de la lecture du fichier : ${error}`));
        };

    })
}