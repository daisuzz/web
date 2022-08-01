import {Link as GatsbyLink} from "gatsby"
import * as React from "react"
import {DateUtils} from "../DateUtils"
import {Box, Link, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography} from "@mui/material";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

interface BlogArticleTableProps {
    blogs: Blog[]
}

export interface Blog {
    blogsId: string
    title: string
    publishedAt: string
}

const BlogTable: React.FC<BlogArticleTableProps> = ({blogs}) => {
    return (
        <TableContainer component={Paper} elevation={0}>
            <Table size="small">
                <TableBody>
                    {blogs.map(blog => {
                        const title = blog.title || blog.blogsId
                        const publishedDate = DateUtils.formatDate(
                            new Date(Date.parse(blog.publishedAt)),
                            "YYYY年MM月DD日 hh:mm"
                        )
                        return (
                            <TableRow key={blog.blogsId}
                                      sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell align="left">
                                    <Typography variant="h6" sx={{
                                        fontFamily: 'Arial Black',
                                        margin: "10px auto"
                                    }}>
                                        <Link
                                            component={GatsbyLink}
                                            to={`/${blog.blogsId}`}
                                            rel="noreferrer noopener"
                                            target="_blank"
                                            color="inherit"
                                            underline="none"
                                        >
                                            {title}
                                        </Link>
                                    </Typography>
                                    <Box sx={{display: {md: 'flex'}}}>
                                        <EventAvailableIcon fontSize="small"/>
                                        <Typography variant="body2" sx={{
                                            margin: "auto auto auto 5px"
                                        }}>
                                            {publishedDate}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default BlogTable
