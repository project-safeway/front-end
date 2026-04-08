# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploy da imagem no ECR

### 1) Login no ECR

```bash
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

aws ecr get-login-password --region "$AWS_REGION" \
	| docker login --username AWS --password-stdin "$ECR_REGISTRY"
```

### 2) Build e push da imagem do Frontend

```bash
TAG=latest
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

docker build -t "$ECR_REGISTRY/safeway-frontend:$TAG" .
docker push "$ECR_REGISTRY/safeway-frontend:$TAG"
```

### 3) Atualizar rollout na infra

No projeto de infraestrutura (`safeway-infra`), confirme a imagem em `terraform.tfvars`:

```hcl
frontend_image = "<account>.dkr.ecr.us-east-1.amazonaws.com/safeway-frontend:latest"
```

Em seguida:

```bash
cd ../safeway-infra
terraform apply
```
